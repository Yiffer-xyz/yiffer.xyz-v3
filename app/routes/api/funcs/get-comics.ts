import { ComicTiny } from '~/types/types';
import { queryDbDirect } from '~/utils/database-facade';

export async function getAllComicNamesAndIDs(
  urlBase: string,
  options?: {
    modifyNameIncludeType?: boolean;
  }
): Promise<ComicTiny[]> {
  let query = 'SELECT name, id, publishStatus FROM comic';
  const response = await queryDbDirect<ComicTiny[]>(urlBase, query);

  if (!options?.modifyNameIncludeType) return response;

  const mappedComics = response.map(comic => {
    if (comic.publishStatus === 'uploaded') {
      comic.name = comic.name + ' (UPLOADED)';
    }
    if (comic.publishStatus === 'pending') {
      comic.name = comic.name + ' (PENDING)';
    }
    return comic;
  });

  return mappedComics;
}
