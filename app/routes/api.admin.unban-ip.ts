import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { queryDbExec } from '~/utils/database-facade';
import { redirectIfNotMod } from '~/utils/loaders';
import {
  create400Json,
  createSuccessJson,
  makeDbErr,
  processApiError,
} from '~/utils/request-helpers';

export async function action(args: ActionFunctionArgs) {
  await redirectIfNotMod(args);

  const formData = await args.request.formData();
  const ip = formData.get('ip');
  if (!ip) return create400Json('Missing ip');

  const dbRes = await queryDbExec(
    args.context.cloudflare.env.DB,
    'DELETE FROM ipban WHERE ip = ?',
    [ip],
    'Unban IP'
  );

  if (dbRes.isError) {
    return processApiError('Error unbanning IP', makeDbErr(dbRes));
  }

  return createSuccessJson();
}
