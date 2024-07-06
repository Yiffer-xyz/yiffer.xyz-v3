import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { type AdType } from '~/types/types';
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

export type EditAdFormData = {
  id: string;
  adType: AdType;
  adName: string;
  link: string;
  mainText?: string | null;
  secondaryText?: string | null;
  notesComments?: string | null;
};

export async function action(args: ActionFunctionArgs) {
  const user = await redirectIfNotLoggedIn(args);
  const formData = await args.request.formData();
  const body = JSON.parse(formData.get('body') as string) as EditAdFormData;

  const { error } = validateAdData(body);
  if (error) {
    return create400Json(error);
  }

  const err = await editAd(args.context.DB, body, user.userId, user.userType !== 'user');
  if (err) {
    return processApiError('Error in /edit-ad', err, { ...body, ...user });
  }
  return createSuccessJson();
}

export async function editAd(
  db: D1Database,
  data: EditAdFormData,
  userId: number,
  isMod: boolean
): Promise<ApiError | undefined> {
  if (!isMod) {
    const isOwner = await isAdOwner(db, userId, data.id);
    if (!isOwner) return { logMessage: 'Not authorized to edit ad' };
  }

  const insertQuery = `UPDATE advertisement 
    SET adName=?, link=?, mainText=?, secondaryText=?, advertiserNotes=?
    WHERE id = ?`;

  const insertParams = [
    data.adName,
    data.link,
    data.mainText ?? null,
    data.secondaryText ?? null,
    data.notesComments,
    data.id,
  ];

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
