import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { queryDbExec } from '~/utils/database-facade';
import { redirectIfNotMod } from '~/utils/loaders';
import type { ApiError, noGetRoute } from '~/utils/request-helpers';
import {
  create400Json,
  createSuccessJson,
  makeDbErr,
  processApiError,
} from '~/utils/request-helpers';

export { noGetRoute as loader };

export async function action(args: ActionFunctionArgs) {
  await redirectIfNotMod(args);
  const formData = await args.request.formData();
  const adId = formData.get('adId');

  if (!adId) {
    return create400Json('Missing ad ID');
  }

  const err = await setAdVideoConverted(args.context.cloudflare.env.DB, adId.toString());
  if (err) {
    return processApiError('Error in /set-ad-video-converted', err, { adId });
  }
  return createSuccessJson();
}

export async function setAdVideoConverted(
  db: D1Database,
  adId: string
): Promise<ApiError | undefined> {
  const query = `UPDATE advertisement SET videoSpecificFileType = NULL WHERE id = ?`;
  const params = [adId];
  const dbRes = await queryDbExec(db, query, params, 'Ad video converted');

  if (dbRes.isError) return makeDbErr(dbRes, 'Error setting ad video converted');
}
