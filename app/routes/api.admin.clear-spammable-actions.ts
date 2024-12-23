import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import type { ApiError } from '~/utils/request-helpers';
import { create400Json, makeDbErr, processApiError } from '~/utils/request-helpers';
import { queryDbExec } from '~/utils/database-facade';

// To be called via a cron job from a Cloudfare worker
// Authorizes via x-yiffer-api-key header that the worker has as a secret
export async function loader(args: LoaderFunctionArgs) {
  const requestApiKeyHeader = args.request.headers.get('x-yiffer-api-key');
  const db = args.context.cloudflare.env.DB;
  const cronKey = args.context.cloudflare.env.CRON_KEY;

  if (cronKey !== requestApiKeyHeader) {
    return create400Json(
      `Invalid x-yiffer-api-key header in /publish-comics-cron: ${requestApiKeyHeader}`
    );
  }

  const dbRes = await clearSpammableActions(db);
  if (dbRes?.error) {
    return processApiError('Error in /clear-spammable-actions', dbRes);
  }

  return new Response(`Cleared spammable actions`, { status: 200 });
}

async function clearSpammableActions(db: D1Database): Promise<ApiError | undefined> {
  const deleteQuery = 'DELETE FROM spammableaction';
  const dbRes = await queryDbExec(db, deleteQuery, [], 'Clear spammable actions');
  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error clearing spammable actions');
  }
}
