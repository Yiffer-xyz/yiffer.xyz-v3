import type { ComicPublishStatus, ComicTiny } from '~/types/types';
import type { QueryWithParams } from '~/utils/database-facade';
import { queryDb } from '~/utils/database-facade';
import type { ResultOrErrorPromise } from '~/utils/request-helpers';
import { makeDbErrObj } from '~/utils/request-helpers';

export type DbComicTiny = {
  name: string;
  id: number;
  publishStatus: ComicPublishStatus;
  hasHighresThumbnail?: 0 | 1;
  published?: string;
};

// NOTE: results after db fetch should go through mapDBComicTiny()
export function getAllComicNamesAndIDsQuery(options?: {
  modifyNameIncludeType?: boolean;
  includeRejectedList?: boolean;
  includeUnlisted?: boolean;
  includeThumbnailStatus?: boolean;
}): QueryWithParams {
  const thumbnailQuery = options?.includeThumbnailStatus
    ? ', hasHighresThumbnail, published'
    : '';

  let query =
    'SELECT name, id, publishStatus' +
    thumbnailQuery +
    ` FROM comic WHERE publishStatus != 'rejected'`;

  if (!options?.includeRejectedList) {
    query += ` AND publishStatus != 'rejected-list' `;
  }
  if (!options?.includeUnlisted) {
    query += ` AND publishStatus != 'unlisted' `;
  }

  return { query };
}

export function mapDBComicTiny(
  dbComics: DbComicTiny[],
  modifyNameIncludeType?: boolean
): ComicTiny[] {
  const mapped = dbComics.map(comic => ({
    name: comic.name,
    id: comic.id,
    publishStatus: comic.publishStatus,
    temp_published: comic.published,
    temp_hasHighresThumbnail: comic.hasHighresThumbnail === 1,
  }));

  if (!modifyNameIncludeType) return mapped;
  return addStateToComicNames(mapped);
}

export async function getAllComicNamesAndIDs(
  db: D1Database,
  options?: {
    modifyNameIncludeType?: boolean;
    includeRejectedList?: boolean;
    includeUnlisted?: boolean;
    includeThumbnailStatus?: boolean;
  }
): ResultOrErrorPromise<ComicTiny[]> {
  const { query } = getAllComicNamesAndIDsQuery();
  const response = await queryDb<DbComicTiny[]>(db, query);
  if (response.isError || !response.result) {
    return makeDbErrObj(response, 'Error  getting comics', options);
  }
  return { result: mapDBComicTiny(response.result, options?.modifyNameIncludeType) };
}

export function getComicsByArtistFieldQuery(
  fieldName: 'id' | 'name',
  fieldValue: string | number,
  options?: {
    includeUnlisted?: boolean;
    includeOnlyPublished?: boolean;
  }
): QueryWithParams {
  let publishStatusFilter = '';
  if (options?.includeOnlyPublished) {
    publishStatusFilter = `AND publishStatus = 'published'`;
  } else {
    publishStatusFilter = `
      AND publishStatus != 'rejected'
      AND publishStatus != 'rejected-list'
    `;
    if (!options?.includeUnlisted) {
      publishStatusFilter += `AND publishStatus != 'unlisted'`;
    }
  }

  const fromWhereStr =
    fieldName === 'id'
      ? 'FROM comic WHERE artist = ?'
      : 'FROM comic INNER JOIN artist ON (artist.id = comic.artist) WHERE artist.name = ?';

  const query = `SELECT comic.name, comic.id, publishStatus
    ${fromWhereStr}
    ${publishStatusFilter}`;

  return {
    query,
    params: [fieldValue],
    errorLogMessage: `Error getting artist comics by ${fieldName}`,
  };
}

export async function getComicsByArtistField(
  db: D1Database,
  fieldName: 'id' | 'name',
  fieldValue: string | number,
  options?: {
    includeUnlisted?: boolean;
    includeOnlyPublished?: boolean;
  }
): ResultOrErrorPromise<ComicTiny[]> {
  const { query, params } = getComicsByArtistFieldQuery(fieldName, fieldValue);

  const dbRes = await queryDb<ComicTiny[]>(db, query, params);
  if (dbRes.isError || !dbRes.result) {
    return makeDbErrObj(dbRes, 'Error getting comics by artist', {
      fieldName,
      fieldValue,
      options,
    });
  }

  const mappedComics = addStateToComicNames(dbRes.result);
  return { result: mappedComics };
}

export function addStateToComicNames(comics: ComicTiny[]): ComicTiny[] {
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
