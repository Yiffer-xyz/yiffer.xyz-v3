import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { deleteComicFiles } from '~/route-funcs/delete-comic-files';
import { getComicByField } from '~/route-funcs/get-comic';
import { queryDbExec } from '~/utils/database-facade';
import { redirectIfNotMod } from '~/utils/loaders';
import type { ApiError, noGetRoute } from '~/utils/request-helpers';
import {
  create400Json,
  createSuccessJson,
  makeDbErr,
  processApiError,
  wrapApiError,
} from '~/utils/request-helpers';

export { noGetRoute as loader };

export async function action(args: ActionFunctionArgs) {
  await redirectIfNotMod(args);

  const formDataBody = await args.request.formData();

  const formComicId = formDataBody.get('comicId');
  if (!formComicId) return create400Json('Missing comicId');

  const err = await deleteComic(
    args.context.cloudflare.env.DB,
    args.context.cloudflare.env.COMICS_BUCKET,
    parseInt(formComicId.toString())
  );

  if (err) {
    return processApiError('Error in /delete-comic', err);
  }
  return createSuccessJson();
}

export async function deleteComic(
  db: D1Database,
  r2: R2Bucket,
  comicId: number
): Promise<ApiError | undefined> {
  const logCtx = { comicId };
  const deleteQuery = 'DELETE FROM comic WHERE id = ?';

  const comicRes = await getComicByField({
    db,
    fieldName: 'id',
    fieldValue: comicId,
    includeMetadata: false,
  });

  if (comicRes.err) {
    return wrapApiError(comicRes.err, 'Error in getComicByField', logCtx);
  }
  if (comicRes.notFound) {
    return {
      logMessage: 'Comic not found in getComicByField',
      context: logCtx,
    };
  }

  const comicName = comicRes.result.name;

  const deleteDbRes = await queryDbExec(db, deleteQuery, [comicId], 'Delete comic');
  if (deleteDbRes.isError) {
    return makeDbErr(deleteDbRes, 'Failed to delete comic', logCtx);
  }

  const err = await deleteComicFiles(r2, comicName);
  if (err) return wrapApiError(err, 'Error in deleteComicFiles', logCtx);
}
