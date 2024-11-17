import { unstable_defineAction } from '@remix-run/cloudflare';
import { queryDbExec } from '~/utils/database-facade';
import { redirectIfNotMod } from '~/utils/loaders';
import { create400Json, createSuccessJson, makeDbErr } from '~/utils/request-helpers';

export const action = unstable_defineAction(async args => {
  await redirectIfNotMod(args);

  const formDataBody = await args.request.formData();

  const formId = formDataBody.get('id');
  if (!formId) return create400Json('Missing id');
  const id = formId.toString();

  const dbRes = await queryDbExec(
    args.context.cloudflare.env.DB,
    'DELETE FROM blog WHERE id = ?',
    [id]
  );

  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error deleting blog', { blogId: id });
  }

  return createSuccessJson();
});
