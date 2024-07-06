import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { AdFreeTrialStateEnum, type AdType } from '~/types/types';
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

export type SubmitAdFormData = {
  id: string;
  isRequestingTrial: boolean;
  adType: AdType;
  link: string;
  adName: string;
  mainText?: string | null;
  secondaryText?: string | null;
  notesComments?: string | null;
  isAnimated: boolean;
};

export async function action(args: ActionFunctionArgs) {
  const user = await redirectIfNotLoggedIn(args);
  const formData = await args.request.formData();
  const body = JSON.parse(formData.get('body') as string) as SubmitAdFormData;

  const { error } = validateAdData(body);
  if (error) {
    return create400Json(error);
  }

  const err = await submitAd(args.context.DB, body, user.userId);
  if (err) {
    return processApiError('Error in /submit-ad', err, { ...body, ...user });
  }
  return createSuccessJson();
}

export async function submitAd(
  db: D1Database,
  data: SubmitAdFormData,
  userId: number
): Promise<ApiError | undefined> {
  const insertQuery = `INSERT INTO advertisement 
    (id, adType, adName, link, mainText, secondaryText, userId, isAnimated, advertiserNotes, freeTrialState)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`;

  const insertParams = [
    data.id,
    data.adType,
    data.adName,
    data.link,
    data.mainText ?? null,
    data.secondaryText ?? null,
    userId,
    data.isAnimated,
    data.notesComments,
    data.isRequestingTrial ? AdFreeTrialStateEnum.Requested : null,
  ];

  const dbRes = await queryDbExec(db, insertQuery, insertParams);
  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error creating ad');
  }
}

function validateAdData(data: SubmitAdFormData): { error: string | null } {
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
