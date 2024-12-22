import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { create400Json, processApiError } from '~/utils/request-helpers';
import { getPendingComics } from '~/route-funcs/get-pending-comics';
import { publishComic } from './api.admin.publish-comic';
import { recalculatePublishingQueue } from '~/route-funcs/publishing-queue';

// To be called via a cron job from a Cloudfare worker
// Authorizes via x-yiffer-api-key header that the worker has as a secret
export async function loader(args: LoaderFunctionArgs) {
  const requestApiKeyHeader = args.request.headers.get('x-yiffer-api-key');
  const db = args.context.cloudflare.env.DB;
  const cronKey = args.context.cloudflare.env.CRON_KEY;
  const schedulePerDay = parseInt(
    args.context.cloudflare.env.DAILY_SCHEDULE_PUBLISH_COUNT as string
  );

  if (cronKey !== requestApiKeyHeader) {
    return create400Json(
      `Invalid x-yiffer-api-key header in /publish-comics-cron: ${requestApiKeyHeader}`
    );
  }

  const dbRes = await getPendingComics(db, true, schedulePerDay, true);
  if (dbRes.err) {
    return processApiError('Error in /publish-comics-cron', dbRes.err);
  }

  for (const comic of dbRes.result) {
    const err = await publishComic(db, comic.comicId);
    if (err) {
      return processApiError(`Error in /publish-comics-cron, failed publishing`, err);
    }
  }

  if (dbRes.result.length > 0) {
    await recalculatePublishingQueue(db);
  }

  return new Response(
    `Cron published comics finished. Comics published: ${dbRes.result.length}.`,
    { status: 200 }
  );
}
