import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { queryDb, queryDbExec } from '~/utils/database-facade';
import { authLoader } from '~/utils/loaders';
import type { ApiError, noGetRoute } from '~/utils/request-helpers';
import {
  create400Json,
  createSuccessJson,
  makeDbErr,
  processApiError,
} from '~/utils/request-helpers';
import { processTagSuggestion } from './api.admin.process-tag-suggestion';
import { getTagSuggestionItemsByGroupId } from '~/route-funcs/get-tagsuggestion-items';

export { noGetRoute as loader };

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
    args.context.cloudflare.env.DB,
    body.comicId,
    body.newTagIDs,
    body.removedTagIDs,
    user?.userId ?? null,
    args.request.headers.get('CF-Connecting-IP') || 'unknown',
    user?.userType === 'moderator' || user?.userType === 'admin'
  );

  if (err) {
    return processApiError('Error in /submit-tag-changes', err);
  }
  return createSuccessJson();
}

export async function submitTagChanges(
  db: D1Database,
  comicId: number,
  newTagIDs: number[],
  removedTagIDs: number[],
  userId: number | null,
  userIP: string,
  isMod: boolean
): Promise<ApiError | undefined> {
  const logCtx = { userId, userIP, comicId, newTagIDs, removedTagIDs };

  const makeGroupQuery = `INSERT INTO tagsuggestiongroup (comicId, userId, userIP) VALUES (?, ?, ?)`;
  const makeGroupParams = [comicId, userId, userIP];
  const makeGroupRes = await queryDbExec(
    db,
    makeGroupQuery,
    makeGroupParams,
    'Tag suggestion group creation'
  );
  if (makeGroupRes.isError) {
    return makeDbErr(makeGroupRes, 'Error making tag suggestion group', logCtx);
  }

  const getGroupIdQuery =
    userId === null
      ? 'SELECT id FROM tagsuggestiongroup WHERE comicId = ? AND userIP = ? ORDER BY id DESC LIMIT 1'
      : `SELECT id FROM tagsuggestiongroup WHERE comicId = ? AND userId = ? ORDER BY id DESC LIMIT 1`;
  const getGroupIdParams = userId === null ? [comicId, userIP] : [comicId, userId];
  const getGroupIdRes = await queryDb<{ id: number }[]>(
    db,
    getGroupIdQuery,
    getGroupIdParams,
    'Tag suggestion group ID'
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
    insertAllItemsParams,
    'Tag suggestion creation'
  );
  if (insertAllItemsRes.isError) {
    return makeDbErr(insertAllItemsRes, 'Error inserting tag suggestion items', logCtx);
  }

  // Approve immediately if mod
  if (isMod && userId) {
    const suggestionItemsRes = await getTagSuggestionItemsByGroupId(db, groupId);
    if (suggestionItemsRes.err) {
      return processApiError(
        'Error getting tag suggestion items',
        suggestionItemsRes.err
      );
    }

    const approvedItems = suggestionItemsRes.result.map(i => ({
      ...i,
      isApproved: true,
    }));

    await processTagSuggestion(db, userId, groupId, comicId, approvedItems, userId);
  }
}
