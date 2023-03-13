import { ComicTiny } from '~/types/types';
import { queryDbDirect } from '~/utils/database-facade';

export async function getAllComicNamesAndIDs(
  urlBase: string,
  options?: {
    modifyNameIncludeType?: boolean;
    includeRejectedList?: boolean;
    includeUnlisted?: boolean;
  }
): Promise<ComicTiny[]> {
  let query =
    'SELECT name, id, publishStatus FROM comic WHERE publishStatus != "rejected"';
  if (!options?.includeRejectedList) {
    query += ' AND publishStatus != "rejected-list" ';
  }
  if (!options?.includeUnlisted) {
    query += ' AND publishStatus != "unlisted" ';
  }

  const response = await queryDbDirect<ComicTiny[]>(urlBase, query);

  if (!options?.modifyNameIncludeType) return response;

  const mappedComics = addStateToComicNames(response);
  return mappedComics;
}

export async function getComicsByArtistId(
  urlBase: string,
  artistId: number
): Promise<ComicTiny[]> {
  const query = `SELECT
      name, id, publishStatus
    FROM comic
    WHERE artist = ?
      AND publishStatus != "rejected"
      AND publishStatus != "rejected-list"
      AND publishStatus != "unlisted"`;

  const response = await queryDbDirect<ComicTiny[]>(urlBase, query, [artistId]);
  const mappedComics = addStateToComicNames(response);
  return mappedComics;
}

function addStateToComicNames(comics: ComicTiny[]): ComicTiny[] {
  const mappedComics = comics.map(comic => {
    if (comic.publishStatus === 'uploaded') {
      comic.name = comic.name + ' (UPLOADED)';
    }
    if (comic.publishStatus === 'pending') {
      comic.name = comic.name + ' (PENDING)';
    }
    if (comic.publishStatus === 'scheduled') {
      comic.name = comic.name + ' (SCHEDULED)';
    }
    if (comic.publishStatus === 'unlisted') {
      comic.name = comic.name + ' (UNLISTED)';
    }
    return comic;
  });

  return mappedComics;
}
