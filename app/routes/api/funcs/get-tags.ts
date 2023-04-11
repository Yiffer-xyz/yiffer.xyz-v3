import { queryDb } from '~/utils/database-facade';
import { Tag } from '~/types/types';
import { ApiError, makeDbErrObj } from '~/utils/request-helpers';

export async function getAllTags(urlBase: string): Promise<{
  err?: ApiError;
  tags?: Tag[];
}> {
  let keywordsQuery = 'SELECT id, keywordName AS name FROM keyword';
  const dbRes = await queryDb<Tag[]>(urlBase, keywordsQuery);
  if (dbRes.errorMessage) {
    return makeDbErrObj(dbRes, 'Error getting all tags');
  }
  return { tags: dbRes.result };
}
