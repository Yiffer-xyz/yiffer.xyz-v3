import { unstable_defineLoader } from '@remix-run/cloudflare';
import { create400Json, processApiError } from '~/utils/request-helpers';
import { getPendingComics } from '~/route-funcs/get-pending-comics';
import { publishComic } from './api.admin.publish-comic';

// To be called via a cron job from a Cloudfare worker
// Authorizes via x-yiffer-api-key header that the worker has as a secret
export const loader = unstable_defineLoader(async args => {
  const requestApiKeyHeader = args.request.headers.get('x-yiffer-api-key');
  const db = args.context.cloudflare.env.DB;
  // const cronKey = args.context.cloudflare.env.CRON_KEY;
  const cronKey = 'test';
  const schedulePerDay = parseInt(
    args.context.cloudflare.env.DAILY_SCHEDULE_PUBLISH_COUNT as string
  );

  if (cronKey !== requestApiKeyHeader) {
    // logApiErrorMessage('Invalid x-yiffer-api-key header in /publish-comics-cron', {
    //   requestApiKeyHeader,
    // });
    return create400Json(
      `Invalid x-yiffer-api-key header in /publish-comics-cron: ${requestApiKeyHeader}`
    );
  }

  const dbRes = await getPendingComics(db, true, schedulePerDay);
  if (dbRes.err) {
    return processApiError('Error in /publish-comics-cron', dbRes.err);
  }

  for (const comic of dbRes.result) {
    const err = await publishComic(db, comic.comicId);
    if (err) {
      return processApiError(`Error in /publish-comics-cron, failed publishing`, err);
    }
  }

  return new Response(
    `Cron published comics finished. Comics published: ${dbRes.result.length}.`,
    { status: 200 }
  );
});
