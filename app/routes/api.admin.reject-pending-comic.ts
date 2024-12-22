import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { queryDbExec } from '~/utils/database-facade';
import { redirectIfNotMod } from '~/utils/loaders';
import type { ApiError, noGetRoute } from '~/utils/request-helpers';
import { createSuccessJson, makeDbErr, processApiError } from '~/utils/request-helpers';

export { noGetRoute as loader };

export async function action(args: ActionFunctionArgs) {
  await redirectIfNotMod(args);

  const formDataBody = await args.request.formData();
  const formComicId = formDataBody.get('comicId');
  if (!formComicId) return new Response('Missing comicId', { status: 400 });

  const err = await rejectComic(
    args.context.cloudflare.env.DB,
    parseInt(formComicId.toString())
  );

  if (err) {
    return processApiError('Error in /reject-pending-comic', err);
  }
  return createSuccessJson();
}

export async function rejectComic(
  db: D1Database,
  comicId: number
): Promise<ApiError | undefined> {
  const updateActionQuery = `UPDATE comic SET publishStatus = 'rejected' WHERE id = ?`;
  const dbRes = await queryDbExec(db, updateActionQuery, [comicId], 'Comic reject');
  if (dbRes.isError) {
    return makeDbErr(
      dbRes,
      'Error rejecting comic, could not set publishStatus rejected',
      { comicId }
    );
  }
}
