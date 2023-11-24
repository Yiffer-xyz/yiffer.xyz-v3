import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import {
  create400Json,
  logApiErrorMessage,
  processApiError,
} from '~/utils/request-helpers';
import { getPendingComics } from '~/route-funcs/get-pending-comics';
import { publishComic } from './api.admin.publish-comic';

// To be called via a cron job from a Cloudfare worker
// Authorizes via x-yiffer-api-key header that the worker has as a secret
export async function loader(args: LoaderFunctionArgs) {
  const requestApiKeyHeader = args.request.headers.get('x-yiffer-api-key');
  const urlBase = args.context.DB_API_URL_BASE;
  const cronKey = args.context.CRON_KEY;
  const schedulePerDay = parseInt(args.context.DAILY_SCHEDULE_PUBLISH_COUNT as string);

  if (cronKey !== requestApiKeyHeader) {
    logApiErrorMessage('Invalid x-yiffer-api-key header in /publish-comics-cron', {
      requestApiKeyHeader,
    });
    return create400Json(
      `Invalid x-yiffer-api-key header in /publish-comics-cron: ${requestApiKeyHeader}`
    );
  }

  const dbRes = await getPendingComics(urlBase, true, schedulePerDay);
  if (dbRes.err) {
    return processApiError('Error in /publish-comics-cron', dbRes.err);
  }

  for (const comic of dbRes.pendingComics) {
    const err = await publishComic(urlBase, comic.comicId);
    if (err) {
      return processApiError(`Error in /publish-comics-cron, failed publishing`, err);
    }
  }

  return new Response(
    `Cron published comics finished. Comics published: ${dbRes.pendingComics?.length}.`,
    { status: 200 }
  );
}
