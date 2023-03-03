import { queryDbDirect } from '~/utils/database-facade';
import { Tag } from '~/types/types';

export async function getAllTags(urlBase: string): Promise<Tag[]> {
  let keywordsQuery = 'SELECT Id AS id, KeywordName AS name FROM keyword';
  const response = await queryDbDirect<Tag[]>(urlBase, keywordsQuery);
  return response;
}
