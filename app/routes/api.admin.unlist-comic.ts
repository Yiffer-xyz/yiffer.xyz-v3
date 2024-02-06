import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import type { DBInputWithErrMsg } from '~/utils/database-facade';
import { queryDb, queryDbMultiple } from '~/utils/database-facade';
import { redirectIfNotMod } from '~/utils/loaders';
import type { ApiError } from '~/utils/request-helpers';
import {
  create400Json,
  createSuccessJson,
  makeDbErr,
  processApiError,
} from '~/utils/request-helpers';

export async function action(args: ActionFunctionArgs) {
  await redirectIfNotMod(args);

  const formDataBody = await args.request.formData();

  const formComicId = formDataBody.get('comicId');
  if (!formComicId) return create400Json('Missing comicId');

  const formUnlistComment = formDataBody.get('unlistComment');
  if (!formUnlistComment) return create400Json('Missing comment');

  const err = await unlistComic(
    args.context.DB,
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

  const detailsDbRes = await queryDb<any[]>(db, getDetailsQuery, [comicId]);
  if (detailsDbRes.isError) {
    return makeDbErr(detailsDbRes, 'Could not get metadata', logCtx);
  }
  const comicUpdateQuery = `UPDATE comic SET publishStatus = 'unlisted' WHERE id = ?`;

  const dbStatements: DBInputWithErrMsg[] = [
    {
      query: comicUpdateQuery,
      params: [comicId],
      errorLogMessage: 'Could not update publishStatus',
    },
  ];

  if (detailsDbRes.result?.length === 0) {
    dbStatements.push({
      query: 'INSERT INTO comicmetadata (comicId, unlistComment) VALUES (?, ?)',
      params: [comicId, unlistComment],
      errorLogMessage: 'Could not insert comic metadata',
    });
  } else {
    dbStatements.push({
      query: 'UPDATE comicmetadata SET unlistComment = ? WHERE comicId = ?',
      params: [unlistComment, comicId],
      errorLogMessage: 'Could not update comic metadata',
    });
  }

  const dbRes = await queryDbMultiple(
    db,
    dbStatements,
    'Error updating comic+metadata in unlistComic'
  );
  if (dbRes.isError) {
    return makeDbErr(dbRes, dbRes.errorMessage, logCtx);
  }
}
