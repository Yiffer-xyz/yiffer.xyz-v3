import type { TagSuggestionItem } from '~/types/types';
import { queryDb } from '~/utils/database-facade';
import type { ResultOrErrorPromise } from '~/utils/request-helpers';
import { makeDbErrObj } from '~/utils/request-helpers';

export async function getTagSuggestionItemsByGroupId(
  db: D1Database,
  groupId: number
): ResultOrErrorPromise<TagSuggestionItem[]> {
  const getTagSuggestionItemsQuery = `SELECT
      keyword.id, keyword.keywordName as name, isApproved, isAdding, tagsuggestionitem.id as tagSuggestionItemId
    FROM tagsuggestionitem INNER JOIN keyword ON tagsuggestionitem.keywordId = keyword.id
    WHERE tagSuggestionGroupId = ?`;
  const getTagSuggestionItemsParams = [groupId];

  const dbRes = await queryDb<TagSuggestionItem[]>(
    db,
    getTagSuggestionItemsQuery,
    getTagSuggestionItemsParams,
    'Tag suggestions by group ID'
  );

  if (dbRes.isError) {
    return makeDbErrObj(dbRes, 'Error getting tag suggestions by group ID', { groupId });
  }

  return { result: dbRes.result };
}
