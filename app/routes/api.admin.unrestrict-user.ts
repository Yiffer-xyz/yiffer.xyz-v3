import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { queryDbExec } from '~/utils/database-facade';
import { redirectIfNotMod } from '~/utils/loaders';
import {
  create400Json,
  createSuccessJson,
  makeDbErr,
  processApiError,
} from '~/utils/request-helpers';
import { validateFormDataNumber } from '~/utils/string-utils';

export async function action(args: ActionFunctionArgs) {
  await redirectIfNotMod(args);

  const formData = await args.request.formData();

  const id = validateFormDataNumber(formData, 'id');
  if (!id) return create400Json('Missing or invalid id');

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
