import { queryDbExec } from '~/utils/database-facade';
import { createSuccessJson, makeDbErr, processApiError } from '~/utils/request-helpers';
import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { redirectIfNotLoggedIn } from '~/utils/loaders';
import { syncPatreonTiers } from '~/route-funcs/sync-patreon-tiers';

export async function loader(args: LoaderFunctionArgs) {
  const user = await redirectIfNotLoggedIn(args);

  const query = 'UPDATE user SET patreonEmail = NULL, patreonDollars = NULL WHERE id = ?';
  const params = [user.userId];
  const dbRes = await queryDbExec(
    args.context.cloudflare.env.DB,
    query,
    params,
    'Unlink patreon account'
  );
  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error unlinking patreon account', {
      userId: user.userId,
    });
  }

  const err = await syncPatreonTiers(
    args.context.cloudflare.env.DB,
    args.context.cloudflare.env.PATREON_CAMPAIGN_ID,
    args.context.cloudflare.env.PATREON_CREATOR_ACCESS_TOKEN
  );
  if (err) {
    return processApiError('Error in /unlink-patreon-email', err, {
      userId: user.userId,
    });
  }

  return createSuccessJson();
}
