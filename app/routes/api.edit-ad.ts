import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import type { AdStatus, AdType } from '~/types/types';
import { queryDbExec } from '~/utils/database-facade';
import { redirectIfNotLoggedIn } from '~/utils/loaders';
import type { ApiError } from '~/utils/request-helpers';
import {
  create400Json,
  createSuccessJson,
  makeDbErr,
  processApiError,
} from '~/utils/request-helpers';
import {
  CARD_AD_MAIN_TEXT_MAX_LENGTH,
  CARD_AD_SECONDARY_TEXT_MAX_LENGTH,
} from '~/types/constants';
import isAdOwner from '~/route-funcs/is-ad-owner';
import { getAdById } from '~/route-funcs/get-ads';
import { differenceInDays } from 'date-fns';
import { createAdStatusChangedEmail, sendEmail } from '~/utils/send-email';

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
    args.context.FRONT_END_URL_BASE,
    args.context.POSTMARK_TOKEN,
    args.context.DB,
    body,
    user.userId,
    user.userType !== 'user',
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
  userId: number,
  isMod: boolean,
  status?: AdStatus | null,
  wasMediaChanged?: boolean
): Promise<ApiError | undefined> {
  if (!isMod) {
    const isOwner = await isAdOwner(db, userId, data.id);
    if (!isOwner) return { logMessage: 'Not authorized to edit ad' };
    if (status) return { logMessage: 'Not authorized to change status' };
  }

  const adRes = await getAdById({ db, adId: data.id });
  if (adRes.err) return adRes.err;
  if (adRes.notFound) return { logMessage: 'Ad not found' };

  const existingAd = adRes.result.ad;

  const shouldPutInActiveChangedState =
    existingAd.status === 'ACTIVE' &&
    !isMod &&
    (wasMediaChanged ||
      existingAd.link !== data.link ||
      existingAd.mainText !== data.mainText ||
      existingAd.secondaryText !== data.secondaryText);

  if (shouldPutInActiveChangedState) {
    await sendEmail(
      createAdStatusChangedEmail({
        adId: existingAd.id,
        adName: existingAd.adName,
        adOwnerName: existingAd.user.username,
        adType: data.adType,
        newAdStatus: 'ACTIVE but CHANGED',
        frontEndUrlBase,
      }),
      postmarkToken
    );
  }

  const maybeStatusStr = status ? `, status = ?` : '';

  const maybeActivationStr =
    status === 'ACTIVE' ? `, lastActivationDate = CURRENT_TIMESTAMP` : '';

  const maybeActiveChangedStr = shouldPutInActiveChangedState
    ? ', isChangedWhileActive = 1'
    : '';

  let maybeDeactivationStr = '';
  if (status === 'ENDED') {
    let newActiveDays = 0;
    if (existingAd.lastActivationDate) {
      newActiveDays =
        differenceInDays(new Date(), new Date(existingAd.lastActivationDate)) + 1;
    }
    maybeDeactivationStr = `, numDaysActive = numDaysActive + ${newActiveDays}, lastActivationDate = NULL`;
  }

  const insertQuery = `UPDATE advertisement 
    SET adName=?, link=?, mainText=?, secondaryText=?, advertiserNotes=?
    ${maybeStatusStr} ${maybeActivationStr} ${maybeActiveChangedStr} ${maybeDeactivationStr}
    WHERE id = ?`;

  const insertParams = [
    data.adName,
    data.link,
    data.mainText ?? null,
    data.secondaryText ?? null,
    data.notesComments,
  ];
  if (status) insertParams.push(status);
  insertParams.push(data.id);

  const dbRes = await queryDbExec(db, insertQuery, insertParams);
  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error updating ad');
  }
}

function validateAdData(data: EditAdFormData): { error: string | null } {
  if (!data.adType || !data.link || !data.adName || !data.id) {
    return { error: 'Missing fields' };
  }
  if (data.adType === 'card') {
    if (!data.mainText) {
      return { error: 'Missing main text' };
    }
    if (data.mainText.length > CARD_AD_MAIN_TEXT_MAX_LENGTH) {
      return { error: `Main text too long` };
    }
    if (
      data.secondaryText &&
      data.secondaryText.length > CARD_AD_SECONDARY_TEXT_MAX_LENGTH
    ) {
      return { error: `Secondary text too long` };
    }
  }

  return { error: null };
}
