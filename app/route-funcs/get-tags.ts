import { queryDb } from '~/utils/database-facade';
import type { Tag } from '~/types/types';
import type { ApiError } from '~/utils/request-helpers';
import { makeDbErrObj } from '~/utils/request-helpers';

export async function getAllTags(urlBase: string): Promise<{
  err?: ApiError;
  tags?: Tag[];
}> {
  const keywordsQuery = 'SELECT id, keywordName AS name FROM keyword';
  const dbRes = await queryDb<Tag[]>(urlBase, keywordsQuery);
  if (dbRes.isError) {
    return makeDbErrObj(dbRes, 'Error getting all tags');
  }
  return { tags: dbRes.result };
}
