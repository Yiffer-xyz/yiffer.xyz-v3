import { isModOrAdmin, type AdStatus, type AdType } from '~/types/types';
import { queryDbExec } from '~/utils/database-facade';
import { redirectIfNotLoggedIn } from '~/utils/loaders';
import type { ApiError, noGetRoute } from '~/utils/request-helpers';
import {
  create400Json,
  createSuccessJson,
  makeDbErr,
  processApiError,
} from '~/utils/request-helpers';
import isAdOwner from '~/route-funcs/is-ad-owner';
import { getAdById } from '~/route-funcs/get-ads';
import { differenceInDays, format } from 'date-fns';
import {
  createModActiveAdChangedEmail,
  createModAdExpiredEmail,
  createModCorrectionAdEditedEmail,
  createModEndedAdEditedEmail,
  createNotifyUserAdActiveEmail,
  createNotifyUserAdExpiredEmail,
  createNotifyUserAdNeedsCorrectionEmail,
  createNotifyUserAdReadyForPaymentEmail,
  sendEmail,
} from '~/utils/send-email';
import { validateAdData } from '~/utils/general';
import type { ActionFunctionArgs } from '@remix-run/cloudflare';

export { noGetRoute as loader };

export type EditAdFormData = {
  id: string;
  adType: AdType;
  adName: string;
  link: string;
  mainText?: string | null;
  secondaryText?: string | null;
  notesComments?: string | null;
  status?: AdStatus | null;
  wasMediaChanged?: boolean;
  correctionNote?: string | null;
  expiryDate?: Date | null;
};

export async function action(args: ActionFunctionArgs) {
  const user = await redirectIfNotLoggedIn(args);
  const formData = await args.request.formData();
  const body = JSON.parse(formData.get('body') as string) as EditAdFormData;

  const { error } = validateAdData(body);
  if (error) {
    return create400Json(error);
  }

  const err = await editAd(
    args.context.cloudflare.env.FRONT_END_URL_BASE,
    args.context.cloudflare.env.POSTMARK_TOKEN,
    args.context.cloudflare.env.DB,
    body,
    isModOrAdmin(user),
    user.userId,
    body.status,
    body.wasMediaChanged
  );
  if (err) {
    return processApiError('Error in /edit-ad', err, { ...body, ...user });
  }
  return createSuccessJson();
}

export async function editAd(
  frontEndUrlBase: string,
  postmarkToken: string,
  db: D1Database,
  data: EditAdFormData,
  isMod: boolean,
  userId?: number,
  status?: AdStatus | null,
  wasMediaChanged?: boolean
): Promise<ApiError | undefined> {
  if (!isMod) {
    if (!userId) return { logMessage: 'User ID is required' };
    const isOwner = await isAdOwner(db, userId, data.id);
    if (!isOwner) return { logMessage: 'Not authorized to edit ad' };
    if (status) return { logMessage: 'Not authorized to change status' };
  }

  const adRes = await getAdById({ db, adId: data.id });
  if (adRes.err) return adRes.err;
  if (adRes.notFound) return { logMessage: 'Ad not found' };

  const existingAd = adRes.result.ad;

  const wasAdContentChanged =
    wasMediaChanged ||
    existingAd.link !== data.link ||
    existingAd.mainText !== data.mainText ||
    existingAd.secondaryText !== data.secondaryText;

  const shouldNotifyActiveAdChanged =
    existingAd.status === 'ACTIVE' && !isMod && wasAdContentChanged;

  const shouldRemoveNeedsCorrectionStatus =
    !isMod && existingAd.status === 'NEEDS CORRECTION' && wasAdContentChanged;

  const isEndedAdEdited = existingAd.status === 'ENDED' && wasAdContentChanged;

  if (shouldNotifyActiveAdChanged) {
    let changedText = '';
    if (wasMediaChanged) {
      changedText += 'Media was changed. ';
    }
    if (existingAd.link !== data.link) {
      changedText += 'Link was changed. ';
    }
    if (existingAd.mainText !== data.mainText) {
      changedText += 'Main text was changed. ';
    }
    if (existingAd.secondaryText !== data.secondaryText) {
      changedText += 'Secondary text was changed. ';
    }
    await sendEmail(
      createModActiveAdChangedEmail({
        adId: existingAd.id,
        adName: existingAd.adName,
        adOwnerName: existingAd.user.username,
        adType: data.adType,
        changedText,
        frontEndUrlBase,
      }),
      postmarkToken
    );
  }

  let maybeStatusStr = '';
  if (status || shouldRemoveNeedsCorrectionStatus || isEndedAdEdited) {
    maybeStatusStr = `, status = ?`;
  }

  const maybeActivationStr =
    status === 'ACTIVE' ? `, lastActivationDate = CURRENT_TIMESTAMP` : '';

  let maybeDeactivationStr = '';
  if (status === 'ENDED') {
    let newActiveDays = 0;
    if (existingAd.lastActivationDate) {
      newActiveDays = differenceInDays(new Date(), existingAd.lastActivationDate) + 1;
    }
    maybeDeactivationStr = `, numDaysActive = numDaysActive + ${newActiveDays}, lastActivationDate = NULL`;
  }

  const insertQuery = `UPDATE advertisement 
    SET adName=?, link=?, mainText=?, secondaryText=?, advertiserNotes=?, correctionNote=?,
    expiryDate=?
    ${maybeStatusStr} ${maybeActivationStr} ${maybeDeactivationStr}
    WHERE id = ?`;

  const expiryDate =
    data.expiryDate && maybeDeactivationStr === ''
      ? format(data.expiryDate, 'yyyy-MM-dd')
      : null;

  const insertParams = [
    data.adName,
    data.link,
    data.mainText ?? null,
    data.secondaryText ?? null,
    data.notesComments ?? null,
    data.correctionNote ?? null,
    expiryDate,
  ];
  if (shouldRemoveNeedsCorrectionStatus) insertParams.push('PENDING');
  else if (isEndedAdEdited) insertParams.push('PENDING');
  else if (status) insertParams.push(status);
  insertParams.push(data.id);

  const dbRes = await queryDbExec(db, insertQuery, insertParams, 'Ad edit');
  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error updating ad');
  }

  if (isMod && status === 'ACTIVE' && existingAd.status !== 'ACTIVE') {
    await sendEmail(
      createNotifyUserAdActiveEmail({
        adId: existingAd.id,
        adName: existingAd.adName,
        expiryDate: data.expiryDate
          ? format(data.expiryDate, 'PPP')
          : '((no expiry date set))',
        recipientEmail: existingAd.user.email,
        frontEndUrlBase,
      }),
      postmarkToken
    );
  }

  if (
    isMod &&
    status === 'AWAITING PAYMENT' &&
    existingAd.status !== 'AWAITING PAYMENT'
  ) {
    await sendEmail(
      createNotifyUserAdReadyForPaymentEmail({
        adId: existingAd.id,
        adName: existingAd.adName,
        adType: existingAd.adType,
        recipientEmail: existingAd.user.email,
        frontEndUrlBase,
      }),
      postmarkToken
    );
  }

  if (
    isMod &&
    status === 'NEEDS CORRECTION' &&
    existingAd.status !== 'NEEDS CORRECTION'
  ) {
    await sendEmail(
      createNotifyUserAdNeedsCorrectionEmail({
        adId: existingAd.id,
        adName: existingAd.adName,
        correctionNote: data.correctionNote ?? 'No correction note provided',
        recipientEmail: existingAd.user.email,
        frontEndUrlBase,
      }),
      postmarkToken
    );
  }

  if (shouldRemoveNeedsCorrectionStatus) {
    await sendEmail(
      createModCorrectionAdEditedEmail({
        adId: existingAd.id,
        adName: existingAd.adName,
        adOwnerName: existingAd.user.username,
        adType: existingAd.adType,
        frontEndUrlBase,
      }),
      postmarkToken
    );
  }

  if (isEndedAdEdited) {
    await sendEmail(
      createModEndedAdEditedEmail({
        adId: existingAd.id,
        adName: existingAd.adName,
        adType: existingAd.adType,
        adOwnerName: existingAd.user.username,
        frontEndUrlBase,
      }),
      postmarkToken
    );
  }

  if (maybeDeactivationStr !== '') {
    await sendEmail(
      createNotifyUserAdExpiredEmail({
        adName: existingAd.adName,
        adId: existingAd.id,
        adType: existingAd.adType,
        recipientEmail: existingAd.user.email,
        frontEndUrlBase,
      }),
      postmarkToken
    );

    await sendEmail(
      createModAdExpiredEmail({
        adName: existingAd.adName,
        adId: existingAd.id,
        adType: existingAd.adType,
        adOwnerName: existingAd.user.username,
        frontEndUrlBase,
      }),
      postmarkToken
    );
  }
}
