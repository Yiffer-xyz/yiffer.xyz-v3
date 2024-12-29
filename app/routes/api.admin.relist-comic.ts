import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { recalculateComicsPaginated } from '~/route-funcs/get-and-cache-comicspaginated';
import { queryDbMultiple } from '~/utils/database-facade';
import { redirectIfNotMod } from '~/utils/loaders';
import type { ApiError } from '~/utils/request-helpers';
import {
  create400Json,
  createSuccessJson,
  makeDbErr,
  noGetRoute,
  processApiError,
  wrapApiError,
} from '~/utils/request-helpers';

export { noGetRoute as loader };

export async function action(args: ActionFunctionArgs) {
  await redirectIfNotMod(args);

  const formDataBody = await args.request.formData();
  const formComicId = formDataBody.get('comicId');
  if (!formComicId) return create400Json('Missing comicId');

  const err = await relistComic(
    args.context.cloudflare.env.DB,
    parseInt(formComicId.toString())
  );
  if (err) {
    return processApiError('Error relisting comic', err);
  }
  return createSuccessJson();
}

export async function relistComic(
  db: D1Database,
  comicId: number
): Promise<ApiError | undefined> {
  const comicQuery = `UPDATE comic SET publishStatus = 'published' WHERE id = ?`;
  const metadataQuery = 'UPDATE comicmetadata SET unlistComment = NULL WHERE comicId = ?';

  const dbRes = await queryDbMultiple(db, [
    {
      query: comicQuery,
      params: [comicId],
    },
    {
      query: metadataQuery,
      params: [comicId],
    },
  ]);

  const logCtx = { comicId };

  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error updating comic+metadata in relistComic', logCtx);
  }

  const recalcRes = await recalculateComicsPaginated(db);
  if (recalcRes) return wrapApiError(recalcRes, 'Error in relistComic', logCtx);
}
