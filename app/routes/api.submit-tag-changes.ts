import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { authLoader } from '~/utils/loaders';
import type { ApiError } from '~/utils/request-helpers';
import {
  create400Json,
  createSuccessJson,
  processApiError,
} from '~/utils/request-helpers';

export type TagChanges = {
  comicId: number;
  newTagIDs: number[];
  removedTagIDs: number[];
};

export async function action(args: ActionFunctionArgs) {
  const user = await authLoader(args);

  const formData = await args.request.formData();
  const body = JSON.parse(formData.get('body') as string) as TagChanges;

  if (!body.comicId) return create400Json('Missing comicId');

  if (!body.newTagIDs || !body.removedTagIDs) {
    return create400Json('Missing newTagIDs or removedTagIDs');
  }
  if (body.newTagIDs.length === 0 && body.removedTagIDs.length === 0) {
    return create400Json('newTagIDs and removedTagIDs cannot both be empty');
  }

  const err = await submitTagChanges(
    args.context.DB,
    body.comicId,
    body.newTagIDs,
    body.removedTagIDs,
    user?.userId,
    args.request.headers.get('CF-Connecting-IP') || 'unknown'
  );

  if (err) {
    return processApiError('Error in /update-your-stars', err);
  }
  return createSuccessJson();
}

export async function submitTagChanges(
  db: D1Database,
  comicId: number,
  newTagIDs: number[],
  removedTagIDs: number[],
  userId: number | undefined,
  userIP: string
): Promise<ApiError | undefined> {
  const logCtx = { userId, userIP, comicId, newTagIDs, removedTagIDs };
  console.log(logCtx);
  return;

  // if (stars === 0) {
  //   const deleteQuery = 'DELETE from comicrating WHERE userId = ? AND comicId = ?';
  //   const dbRes = await queryDbExec(db, deleteQuery, [userId, comicId]);
  //   if (dbRes.isError) {
  //     return makeDbErr(dbRes, 'Error deleting rating', logCtx);
  //   }
  //   return;
  // }

  // const upsertQuery = `
  //   INSERT INTO comicrating (userId, comicId, rating) VALUES (?, ?, ?)
  //   ON CONFLICT (userId, comicId) DO UPDATE SET rating = ?
  // `;
  // const queryParams = [userId, comicId, stars, stars];

  // console.log(upsertQuery, queryParams);

  // const dbRes = await queryDbExec(db, upsertQuery, queryParams);
  // if (dbRes.isError) {
  //   return makeDbErr(dbRes, 'Error upserting comic rating', logCtx);
  // }
}
