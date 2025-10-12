import type { Route } from './+types/ban-ip';
import { queryDbExec } from '~/utils/database-facade';
import { redirectIfNotMod } from '~/utils/loaders';
import {
  create400Json,
  createSuccessJson,
  makeDbErr,
  processApiError,
} from '~/utils/request-helpers';

export async function action(args: Route.ActionArgs) {
  await redirectIfNotMod(args);

  const formData = await args.request.formData();
  const ip = formData.get('ip');
  if (!ip) return create400Json('Missing ip');

  const dbRes = await queryDbExec(
    args.context.cloudflare.env.DB,
    'INSERT OR IGNORE INTO ipban (ip) VALUES (?)',
    [ip],
    'Ban IP'
  );

  if (dbRes.isError) {
    return processApiError('Error banning IP', makeDbErr(dbRes));
  }

  return createSuccessJson();
}
