import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { differenceInDays } from 'date-fns';
import { getAdById } from '~/route-funcs/get-ads';
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

  const err = await deactivateAd(
    args.context.cloudflare.env.DB,
    adId.toString(),
    user.userId,
    isModOrAdmin(user)
  );
  if (err) {
    return processApiError('Error in /deactivate-ad', err, { adId, ...user });
  }
  return createSuccessJson();
}

export async function deactivateAd(
  db: D1Database,
  adId: string,
  userId: number,
  isMod: boolean
): Promise<ApiError | undefined> {
  if (!isMod) {
    const isOwner = await isAdOwner(db, userId, adId);
    if (!isOwner) return { logMessage: 'Not authorized to edit ad' };
  }

  const adRes = await getAdById({ db, adId });
  if (adRes.err) return adRes.err;
  if (adRes.notFound) return { logMessage: 'Ad not found' };

  let newActiveDays = 0;
  if (adRes.result.ad.lastActivationDate) {
    newActiveDays = differenceInDays(new Date(), adRes.result.ad.lastActivationDate) + 1;
  }

  const query = `UPDATE advertisement
    SET status = 'ENDED', numDaysActive = numDaysActive + ?, lastActivationDate = NULL WHERE id = ?`;
  const params = [newActiveDays, adId];
  const dbRes = await queryDbExec(db, query, params, 'Ad deactivate');

  if (dbRes.isError) return makeDbErr(dbRes, 'Error deactivating ad');
}
