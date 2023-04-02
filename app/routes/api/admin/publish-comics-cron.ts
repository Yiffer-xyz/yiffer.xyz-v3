import { LoaderArgs } from '@remix-run/cloudflare';
import { create400Json, logError } from '~/utils/request-helpers';
import { getPendingComics } from '../funcs/get-pending-comics';
import { publishComic } from './publish-comic';

// To be called via a cron job from a Cloudfare worker
// Authorizes via x-yiffer-api-key header that the worker has as a secret
export async function loader(args: LoaderArgs) {
  const requestApiKeyHeader = args.request.headers.get('x-yiffer-api-key');
  const urlBase = args.context.DB_API_URL_BASE as string;
  const cronKey = args.context.CRON_KEY as string;
  const schedulePerDay = parseInt(args.context.DAILY_SCHEDULE_PUBLISH_COUNT as string);

  if (cronKey !== requestApiKeyHeader) {
    logError(
      `Invalid x-yiffer-api-key header in /publish-comics-cron: ${requestApiKeyHeader}`,
      ''
    );
    return create400Json(
      `Invalid x-yiffer-api-key header in /publish-comics-cron: ${requestApiKeyHeader}`
    );
  }

  const { err, pendingComics } = await getPendingComics(urlBase, true, schedulePerDay);
  if (err) {
    logError('Error getting pending comics from cron job', err);
    return new Response('Error getting pending comics', { status: 500 });
  }

  for (const comic of pendingComics!) {
    const err = await publishComic(urlBase, comic.comicId);
    if (err) {
      logError(
        `Error in /publish-comics-cron, failed publishing comic ${comic.comicId}`,
        err
      );
      return new Response('Error publishing pending comic', { status: 500 });
    }
  }

  return new Response(
    `Cron published comics finished. Comics published: ${pendingComics?.length}.`,
    { status: 200 }
  );
}
