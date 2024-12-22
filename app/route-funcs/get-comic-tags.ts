import type { Tag } from '~/types/types';
import { queryDb } from '~/utils/database-facade';
import type { ResultOrErrorPromise } from '~/utils/request-helpers';
import { makeDbErrObj } from '~/utils/request-helpers';

export async function getComicTags(
  db: D1Database,
  comicId: number
): ResultOrErrorPromise<Tag[]> {
  const tagsQuery = `SELECT id, keywordName AS name FROM keyword
    INNER JOIN comickeyword ON (keyword.id = comickeyword.keywordId)
    WHERE comicId = ?`;

  const dbRes = await queryDb<Tag[]>(db, tagsQuery, [comicId], 'Comic tags');

  if (dbRes.isError || !dbRes.result) {
    return makeDbErrObj(dbRes, 'Error getting all tags for comic', { comicId });
  }

  return { result: dbRes.result };
}
