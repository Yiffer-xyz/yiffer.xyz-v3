import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import isAdOwner from '~/route-funcs/is-ad-owner';
import { isModOrAdmin } from '~/types/types';
import { queryDbExec } from '~/utils/database-facade';
import { redirectIfNotLoggedIn } from '~/utils/loaders';
import type { ApiError, noGetRoute } from '~/utils/request-helpers';
import {
  create400Json,
  createSuccessJson,
  makeDbErr,
  processApiError,
} from '~/utils/request-helpers';

export { noGetRoute as loader };

export async function action(args: ActionFunctionArgs) {
  const user = await redirectIfNotLoggedIn(args);
  const formData = await args.request.formData();
  const adId = formData.get('id');

  if (!adId) {
    return create400Json('Missing ad ID');
  }

  const err = await deleteAd(
    args.context.cloudflare.env.DB,
    adId.toString(),
    user.userId,
    isModOrAdmin(user)
  );
  if (err) {
    return processApiError('Error in /delete-ad', err, { adId, ...user });
  }
  return createSuccessJson();
}

export async function deleteAd(
  db: D1Database,
  adId: string,
  userId: number,
  isMod: boolean
): Promise<ApiError | undefined> {
  if (!isMod) {
    const isOwner = await isAdOwner(db, userId, adId);
    if (!isOwner) return { logMessage: 'Not authorized to edit ad' };
  }

  const query = `DELETE FROM advertisement WHERE id = ?`;
  const params = [adId];
  const dbRes = await queryDbExec(db, query, params, 'Ad delete');

  if (dbRes.isError) return makeDbErr(dbRes, 'Error deleting ad');
}
