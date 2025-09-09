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
  const id = formData.get('id');
  if (!id) return create400Json('Missing id');
  if (Number.isNaN(id)) return create400Json('Invalid id');

  const dbRes = await queryDbExec(
    args.context.cloudflare.env.DB,
    'DELETE FROM userrestriction WHERE id = ?',
    [id],
    'Unrestrict user'
  );

  if (dbRes.isError) {
    return processApiError('Error unrestricting user', makeDbErr(dbRes));
  }

  return createSuccessJson();
}
