import { queryDb } from '~/utils/database-facade';
import type { Tag } from '~/types/types';
import type { ResultOrErrorPromise } from '~/utils/request-helpers';
import { makeDbErrObj } from '~/utils/request-helpers';

export async function getAllTags(urlBase: string): ResultOrErrorPromise<Tag[]> {
  const keywordsQuery = 'SELECT id, keywordName AS name FROM keyword';
  const dbRes = await queryDb<Tag[]>(urlBase, keywordsQuery);
  if (dbRes.isError || !dbRes.result) {
    return makeDbErrObj(dbRes, 'Error getting all tags');
  }
  return { result: dbRes.result };
}
