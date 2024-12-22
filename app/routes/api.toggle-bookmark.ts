import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { queryDb, queryDbExec } from '~/utils/database-facade';
import { redirectIfNotLoggedIn } from '~/utils/loaders';
import type { ApiError, noGetRoute } from '~/utils/request-helpers';
import {
  create400Json,
  createSuccessJson,
  makeDbErr,
  processApiError,
} from '~/utils/request-helpers';

export { noGetRoute as loader };

export async function action(args: ActionFunctionArgs) {
  const user = await redirectIfNotLoggedIn(args);

  const formDataBody = await args.request.formData();

  const formComicId = formDataBody.get('comicId');
  if (!formComicId) return create400Json('Missing comicId');
  const comicId = parseInt(formComicId.toString());
  if (isNaN(comicId)) return create400Json('Invalid comicId');

  const err = await toggleComicBookmark(
    args.context.cloudflare.env.DB,
    user.userId,
    comicId
  );
  if (err) {
    return processApiError('Error in /toggle-bookmark', err);
  }
  return createSuccessJson();
}

export async function toggleComicBookmark(
  db: D1Database,
  userId: number,
  comicId: number
): Promise<ApiError | undefined> {
  const logCtx = { userId, comicId };

  const doesBookmarkExistQuery =
    'SELECT * FROM comicbookmark WHERE userId = ? AND comicId = ?';
  const doesBookmarkExistParams = [userId, comicId];
  const doesBookmarkExistRes = await queryDb<any[]>(
    db,
    doesBookmarkExistQuery,
    doesBookmarkExistParams,
    'Bookmark exists check'
  );
  if (doesBookmarkExistRes.isError) {
    return makeDbErr(doesBookmarkExistRes, 'Error checking if bookmark exists', logCtx);
  }

  if (doesBookmarkExistRes.result.length > 0) {
    const deleteQuery = 'DELETE from comicbookmark WHERE userId = ? AND comicId = ?';
    const dbRes = await queryDbExec(
      db,
      deleteQuery,
      [userId, comicId],
      'Bookmark delete'
    );
    if (dbRes.isError) {
      return makeDbErr(dbRes, 'Error deleting bookmark', logCtx);
    }
    return;
  }

  const insertQuery = 'INSERT INTO comicbookmark (userId, comicId) VALUES (?, ?)';
  const insertParams = [userId, comicId];
  const insertRes = await queryDbExec(db, insertQuery, insertParams, 'Bookmark insert');
  if (insertRes.isError) {
    return makeDbErr(insertRes, 'Error inserting bookmark', logCtx);
  }
}
