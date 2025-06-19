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

  const err = await toggleComicSubscription(
    args.context.cloudflare.env.DB,
    user.userId,
    comicId
  );
  if (err) {
    return processApiError('Error in /subscribe-comic', err);
  }
  return createSuccessJson();
}

export async function toggleComicSubscription(
  db: D1Database,
  userId: number,
  comicId: number
): Promise<ApiError | undefined> {
  const logCtx = { userId, comicId };

  const doesSubscriptionExistQuery =
    'SELECT * FROM comicsubscription WHERE userId = ? AND comicId = ?';
  const doesSubscriptionExistParams = [userId, comicId];
  const doesSubscriptionExistRes = await queryDb<any[]>(
    db,
    doesSubscriptionExistQuery,
    doesSubscriptionExistParams,
    'Subscription exists check'
  );
  if (doesSubscriptionExistRes.isError) {
    return makeDbErr(doesSubscriptionExistRes, 'Error checking if subscription exists', logCtx);
  }

  if (doesSubscriptionExistRes.result.length > 0) {
    const deleteQuery = 'DELETE from comicsubscription WHERE userId = ? AND comicId = ?';
    const dbRes = await queryDbExec(
      db,
      deleteQuery,
      [userId, comicId],
      'Subscription delete'
    );
    if (dbRes.isError) {
      return makeDbErr(dbRes, 'Error deleting subscription', logCtx);
    }
    return;
  }

  const insertQuery = 'INSERT INTO comicsubscription (userId, comicId) VALUES (?, ?)';
  const insertParams = [userId, comicId];
  const insertRes = await queryDbExec(db, insertQuery, insertParams, 'Subscription insert');
  if (insertRes.isError) {
    return makeDbErr(insertRes, 'Error inserting subscription', logCtx);
  }
} 