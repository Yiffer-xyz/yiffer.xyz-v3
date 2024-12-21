import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { create400Json, processApiError } from '~/utils/request-helpers';
import { getAds } from '~/route-funcs/get-ads';
import { isBefore, isSameDay } from 'date-fns';
import { editAd } from './api.edit-ad';

// To be called via a cron job from a Cloudfare worker
// Authorizes via x-yiffer-api-key header that the worker has as a secret
export async function loader(args: LoaderFunctionArgs) {
  const requestApiKeyHeader = args.request.headers.get('x-yiffer-api-key');
  const db = args.context.cloudflare.env.DB;
  const cronKey = args.context.cloudflare.env.CRON_KEY;

  if (cronKey !== requestApiKeyHeader) {
    return create400Json(
      `Invalid x-yiffer-api-key header in /update-expired-ads: ${requestApiKeyHeader}`
    );
  }

  const dbRes = await getAds({
    db,
    statusFilter: ['ACTIVE'],
  });
  if (dbRes.err) {
    return processApiError('Error in /update-expired-ads', dbRes.err);
  }

  const today = new Date();
  let adsExpiredCount = 0;

  for (const ad of dbRes.result) {
    if (!ad.expiryDate) continue;

    const shouldExpire =
      !isSameDay(ad.expiryDate, today) && isBefore(ad.expiryDate, today);
    if (!shouldExpire) continue;

    adsExpiredCount++;

    const err = await editAd(
      args.context.cloudflare.env.FRONT_END_URL_BASE,
      args.context.cloudflare.env.POSTMARK_TOKEN,
      db,
      ad,
      true,
      undefined,
      'ENDED',
      false
    );

    if (err) {
      return processApiError(`Error in /update-expired-ads, failed updating`, err);
    }
  }

  return new Response(`Cron expired ads finished. Ads expired: ${adsExpiredCount}.`, {
    status: 200,
  });
}
