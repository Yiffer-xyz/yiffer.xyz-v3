import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { create400Json, processApiError } from '~/utils/request-helpers';
import { syncPatreonTiers } from '~/route-funcs/sync-patreon-tiers';
import { authLoader } from '~/utils/loaders';

// To be called via a cron job from a Cloudfare worker
// Authorizes via x-yiffer-api-key header that the worker has as a secret
export async function loader(args: LoaderFunctionArgs) {
  const user = await authLoader(args);
  const requestApiKeyHeader = args.request.headers.get('x-yiffer-api-key');
  const db = args.context.cloudflare.env.DB;
  const cronKey = args.context.cloudflare.env.CRON_KEY;
  const campaignId = args.context.cloudflare.env.PATREON_CAMPAIGN_ID;
  const creatorAccessToken = args.context.cloudflare.env.PATREON_CREATOR_ACCESS_TOKEN;

  if (!user) {
    if (cronKey !== requestApiKeyHeader) {
      return create400Json(
        `Invalid x-yiffer-api-key header in /sync-patreons: ${requestApiKeyHeader}`
      );
    }
  }

  const err = await syncPatreonTiers(db, campaignId, creatorAccessToken);
  if (err) {
    return processApiError('Error in /sync-patreons', err);
  }

  return new Response(null, { status: 200 });
}
