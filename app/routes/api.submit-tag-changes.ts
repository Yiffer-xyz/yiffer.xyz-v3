import { unstable_defineAction } from '@remix-run/cloudflare';
import { queryDb, queryDbExec } from '~/utils/database-facade';
import { authLoader } from '~/utils/loaders';
import type { ApiError } from '~/utils/request-helpers';
import {
  create400Json,
  createSuccessJson,
  makeDbErr,
  processApiError,
} from '~/utils/request-helpers';

export type TagChanges = {
  comicId: number;
  newTagIDs: number[];
  removedTagIDs: number[];
};

export const action = unstable_defineAction(async args => {
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
    args.context.cloudflare.env.DB,
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
});

export async function submitTagChanges(
  db: D1Database,
  comicId: number,
  newTagIDs: number[],
  removedTagIDs: number[],
  userId: number | undefined,
  userIP: string
): Promise<ApiError | undefined> {
  const logCtx = { userId, userIP, comicId, newTagIDs, removedTagIDs };

  const makeGroupQuery = `INSERT INTO tagsuggestiongroup (comicId, userId, userIP) VALUES (?, ?, ?)`;
  const makeGroupParams = [comicId, userId, userIP];
  const makeGroupRes = await queryDbExec(db, makeGroupQuery, makeGroupParams);
  if (makeGroupRes.isError) {
    return makeDbErr(makeGroupRes, 'Error making tag suggestion group', logCtx);
  }

  const getGroupIdQuery = `SELECT id FROM tagsuggestiongroup WHERE comicId = ? AND userId = ? AND userIP = ? ORDER BY id DESC LIMIT 1`;
  const getGroupIdParams = [comicId, userId, userIP];
  const getGroupIdRes = await queryDb<{ id: number }[]>(
    db,
    getGroupIdQuery,
    getGroupIdParams
  );
  if (getGroupIdRes.isError) {
    return makeDbErr(getGroupIdRes, 'Error getting tag suggestion group ID', logCtx);
  }
  const groupId = getGroupIdRes.result[0].id;

  let insertAllItemsQuery =
    'INSERT INTO tagsuggestionitem (tagSuggestionGroupId, keywordId, isAdding) VALUES ';
  const insertAllItemsParams: any[] = [];

  [...newTagIDs, ...removedTagIDs].forEach(tagId => {
    insertAllItemsQuery += '(?, ?, ?), ';
    insertAllItemsParams.push(groupId, tagId, newTagIDs.includes(tagId) ? 1 : 0);
  });
  insertAllItemsQuery = insertAllItemsQuery.slice(0, -2);

  const insertAllItemsRes = await queryDbExec(
    db,
    insertAllItemsQuery,
    insertAllItemsParams
  );
  if (insertAllItemsRes.isError) {
    return makeDbErr(insertAllItemsRes, 'Error inserting tag suggestion items', logCtx);
  }
}
