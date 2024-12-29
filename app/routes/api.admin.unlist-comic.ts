import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { recalculateComicsPaginated } from '~/route-funcs/get-and-cache-comicspaginated';
import type { QueryWithParams } from '~/utils/database-facade';
import { queryDb, queryDbMultiple } from '~/utils/database-facade';
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

  const formUnlistComment = formDataBody.get('unlistComment');
  if (!formUnlistComment) return create400Json('Missing comment');

  const err = await unlistComic(
    args.context.cloudflare.env.DB,
    parseInt(formComicId.toString()),
    formUnlistComment.toString()
  );

  if (err) {
    return processApiError('Error in /unlist-comic', err);
  }
  return createSuccessJson();
}

export async function unlistComic(
  db: D1Database,
  comicId: number,
  unlistComment: string
): Promise<ApiError | undefined> {
  const logCtx = { comicId, unlistComment };
  const getDetailsQuery = 'SELECT comicId FROM comicmetadata WHERE comicId = ?';

  const detailsDbRes = await queryDb<any[]>(
    db,
    getDetailsQuery,
    [comicId],
    'Comic metadata exists check'
  );
  if (detailsDbRes.isError) {
    return makeDbErr(detailsDbRes, 'Could not get metadata', logCtx);
  }
  const comicUpdateQuery = `UPDATE comic SET publishStatus = 'unlisted' WHERE id = ?`;

  const dbStatements: QueryWithParams[] = [
    {
      query: comicUpdateQuery,
      params: [comicId],
    },
  ];

  if (detailsDbRes.result?.length === 0) {
    dbStatements.push({
      query: 'INSERT INTO comicmetadata (comicId, unlistComment) VALUES (?, ?)',
      params: [comicId, unlistComment],
    });
  } else {
    dbStatements.push({
      query: 'UPDATE comicmetadata SET unlistComment = ? WHERE comicId = ?',
      params: [unlistComment, comicId],
    });
  }

  const dbRes = await queryDbMultiple(db, dbStatements);
  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error updating comic+metadata in unlistComic', logCtx);
  }

  const recalcRes = await recalculateComicsPaginated(db);
  if (recalcRes) return wrapApiError(recalcRes, 'Error in unlistComic', logCtx);
}
