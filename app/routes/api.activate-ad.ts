import { unstable_defineAction } from '@remix-run/cloudflare';
import { getAdById } from '~/route-funcs/get-ads';
import isAdOwner from '~/route-funcs/is-ad-owner';
import { queryDbExec } from '~/utils/database-facade';
import { redirectIfNotLoggedIn } from '~/utils/loaders';
import type { ApiError } from '~/utils/request-helpers';
import {
  create400Json,
  createSuccessJson,
  makeDbErr,
  processApiError,
} from '~/utils/request-helpers';

export const action = unstable_defineAction(async args => {
  const user = await redirectIfNotLoggedIn(args);
  const formData = await args.request.formData();
  const adId = formData.get('id');

  if (!adId) {
    return create400Json('Missing ad ID');
  }

  const err = await activateAd(
    args.context.cloudflare.env.DB,
    adId.toString(),
    user.userId,
    user.userType !== 'user'
  );
  if (err) {
    return processApiError('Error in /activate-ad', err, { adId, ...user });
  }

  return createSuccessJson();
});

export async function activateAd(
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

  const query = `UPDATE advertisement
    SET status = 'ACTIVE', lastActivationDate = CURRENT_TIMESTAMP
    WHERE id = ?`;
  const params = [adId];
  const dbRes = await queryDbExec(db, query, params);

  if (dbRes.isError) return makeDbErr(dbRes, 'Error activating ad');
}
