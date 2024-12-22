import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { queryDbExec } from '~/utils/database-facade';
import {
  create400Json,
  createSuccessJson,
  makeDbErr,
  noGetRoute,
  processApiError,
  type ApiError,
} from '~/utils/request-helpers';

export { noGetRoute as loader };

export async function action(args: ActionFunctionArgs) {
  const formDataBody = await args.request.formData();
  const formAdId = formDataBody.get('adId');
  if (!formAdId) return create400Json('Missing adId');
  const adId = formAdId.toString();

  const err = await logAdClick(args.context.cloudflare.env.DB, adId);
  if (err) {
    return processApiError('Error in /log-click (ad)', err, { comicId: adId });
  }
  return createSuccessJson();
}

export async function logAdClick(
  db: D1Database,
  adId: string
): Promise<ApiError | undefined> {
  const query = `INSERT INTO advertisementdayclick (adId, date, clicks) VALUES (?, ?, ?)
    ON CONFLICT (adId, date) DO UPDATE SET clicks = advertisementdayclick.clicks + 1`;

  const date = new Date().toISOString().split('T')[0];
  const params = [adId, date, 1];

  const dbRes = await queryDbExec(db, query, params, 'Ad click logging');
  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error logging ad click');
  }
}
