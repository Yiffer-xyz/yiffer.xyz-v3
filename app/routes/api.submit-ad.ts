import { AdFreeTrialStateEnum } from '~/types/types';
import type { UserSession, AdType, AdMediaType } from '~/types/types';
import { queryDbExec } from '~/utils/database-facade';
import { redirectIfNotLoggedIn } from '~/utils/loaders';
import type { ApiError, noGetRoute } from '~/utils/request-helpers';
import {
  create400Json,
  createSuccessJson,
  makeDbErr,
  processApiError,
} from '~/utils/request-helpers';
import {
  createModNewAdEmail,
  createNotifyUserNewAdEmail,
  sendEmail,
} from '~/utils/send-email';
import { validateAdData } from '~/utils/general';
import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { getUserById } from '~/route-funcs/get-user';

export { noGetRoute as loader };

export type SubmitAdFormData = {
  id: string;
  isRequestingTrial: boolean;
  adType: AdType;
  mediaType: AdMediaType;
  link: string;
  adName: string;
  mainText?: string | null;
  secondaryText?: string | null;
  notesComments?: string | null;
  isAnimated: boolean;
  videoSpecificFileType?: string | null;
};

export async function action(args: ActionFunctionArgs) {
  const user = await redirectIfNotLoggedIn(args);
  const formData = await args.request.formData();
  const body = JSON.parse(formData.get('body') as string) as SubmitAdFormData;

  const { error } = validateAdData(body);
  if (error) {
    return create400Json(error);
  }

  const err = await submitAd(
    args.context.cloudflare.env.DB,
    args.context.cloudflare.env.FRONT_END_URL_BASE,
    args.context.cloudflare.env.POSTMARK_TOKEN,
    body,
    user
  );
  if (err) {
    return processApiError('Error in /submit-ad', err, { ...body, ...user });
  }

  return createSuccessJson();
}

export async function submitAd(
  db: D1Database,
  frontEndUrlBase: string,
  postmarkToken: string,
  data: SubmitAdFormData,
  user: UserSession
): Promise<ApiError | undefined> {
  const fullUser = await getUserById(db, user.userId);
  if (fullUser.err) return fullUser.err;

  const insertQuery = `INSERT INTO advertisement
    (id, adType, mediaType, adName, link, mainText, secondaryText, userId, isAnimated, advertiserNotes, freeTrialState, videoSpecificFileType)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`;

  const insertParams = [
    data.id,
    data.adType,
    data.mediaType,
    data.adName,
    data.link,
    data.mainText ?? null,
    data.secondaryText ?? null,
    user.userId,
    data.isAnimated,
    data.notesComments,
    data.isRequestingTrial ? AdFreeTrialStateEnum.Requested : null,
    data.videoSpecificFileType ?? null,
  ];

  const dbRes = await queryDbExec(db, insertQuery, insertParams, 'Ad creation');
  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error creating ad');
  }

  await sendEmail(
    createModNewAdEmail({
      adId: data.id,
      adName: data.adName,
      adOwnerName: user.username,
      adType: data.adType,
      frontEndUrlBase,
    }),
    postmarkToken
  );

  await sendEmail(
    createNotifyUserNewAdEmail({
      adName: data.adName,
      adId: data.id,
      adType: data.adType,
      recipientEmail: fullUser.result.email,
      frontEndUrlBase,
    }),
    postmarkToken
  );
}
