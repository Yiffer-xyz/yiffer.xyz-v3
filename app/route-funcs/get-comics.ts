import type { ComicPublishStatus, ComicTiny } from '~/types/types';
import { queryDb } from '~/utils/database-facade';
import type { ApiError } from '~/utils/request-helpers';
import { makeDbErrObj } from '~/utils/request-helpers';

type DbComicTiny = {
  name: string;
  id: number;
  publishStatus: ComicPublishStatus;
  hasHighresThumbnail?: 0 | 1;
  published?: string;
};

export async function getAllComicNamesAndIDs(
  urlBase: string,
  options?: {
    modifyNameIncludeType?: boolean;
    includeRejectedList?: boolean;
    includeUnlisted?: boolean;
    includeThumbnailStatus?: boolean; // TODO: Remove once all thumbnails are fixed
  }
): Promise<{ err?: ApiError; comics?: ComicTiny[] }> {
  const thumbnailQuery = options?.includeThumbnailStatus
    ? ', hasHighresThumbnail, published'
    : '';

  let query =
    'SELECT name, id, publishStatus' +
    thumbnailQuery +
    ' FROM comic WHERE publishStatus != "rejected"';

  if (!options?.includeRejectedList) {
    query += ' AND publishStatus != "rejected-list" ';
  }
  if (!options?.includeUnlisted) {
    query += ' AND publishStatus != "unlisted" ';
  }

  const response = await queryDb<DbComicTiny[]>(urlBase, query);
  if (response.isError || !response.result) {
    return makeDbErrObj(response, 'Error  getting comics', options);
  }

  const comics: ComicTiny[] = response.result.map(comic => ({
    name: comic.name,
    id: comic.id,
    publishStatus: comic.publishStatus,
    temp_published: comic.published,
    temp_hasHighresThumbnail: comic.hasHighresThumbnail === 1,
  }));

  if (!options?.modifyNameIncludeType) return { comics };

  const mappedComics = addStateToComicNames(comics);
  return { comics: mappedComics };
}

export async function getComicsByArtistId(
  urlBase: string,
  artistId: number,
  options?: {
    includeUnlisted: boolean;
  }
): Promise<{ comics?: ComicTiny[]; err?: ApiError }> {
  const query = `SELECT
      name, id, publishStatus
    FROM comic
    WHERE artist = ?
      AND publishStatus != "rejected"
      AND publishStatus != "rejected-list"
      ${options?.includeUnlisted ? '' : 'AND publishStatus != "unlisted"'}`;

  const dbRes = await queryDb<ComicTiny[]>(urlBase, query, [artistId]);
  if (dbRes.isError) {
    return makeDbErrObj(dbRes, 'Error getting comics by artist', { artistId, options });
  }

  const mappedComics = addStateToComicNames(dbRes.result as ComicTiny[]);
  return { comics: mappedComics };
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
