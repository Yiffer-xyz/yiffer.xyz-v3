import type { Artist, ComicForBrowse } from '~/types/types';
import type { QueryWithParams } from '~/utils/database-facade';
import { queryDb } from '~/utils/database-facade';
import type { ResultOrNotFoundOrErrorPromise } from '~/utils/request-helpers';
import { makeDbErrObj, processApiError } from '~/utils/request-helpers';
import { getComicsPaginated } from './get-comics-paginated';

type DbArtist = {
  id: number;
  name: string;
  patreonName: string;
  e621Name: string;
  isPending: 0 | 1;
  isBanned: 0 | 1;
  isRejected: 0 | 1;
  linksString: string;
};

export async function getArtistAndComicsByField(
  db: D1Database,
  fieldName: 'id' | 'name',
  fieldValue: string | number,
  userId?: number | undefined
): ResultOrNotFoundOrErrorPromise<{
  artist: Artist;
  comics: ComicForBrowse[];
}> {
  const { query, params } = getArtistByFieldQuery(fieldName, fieldValue);

  const artistRes = await queryDb<DbArtist[]>(db, query, params, 'Artist');
  if (artistRes.isError) {
    return makeDbErrObj(artistRes, 'Error getting artist and comics by field', {
      fieldName,
      fieldValue,
    });
  }
  if (artistRes.result.length === 0) {
    return { notFound: true };
  }
  const artistId = artistRes.result[0].id;

  const comicsRes = await getComicsPaginated({
    db,
    artistId,
    includeAds: false,
    includeTags: true,
    order: 'updated',
    userId,
  });

  if (comicsRes.err) {
    return processApiError('Error getting comics, get-artist', comicsRes.err);
  }
  if (comicsRes.result.comicsAndAds.length === 0) {
    return { notFound: true };
  }

  return {
    result: {
      artist: dbArtistToArtist(artistRes.result[0]),
      comics: comicsRes.result.comicsAndAds as ComicForBrowse[],
    },
  };
}

export function getArtistByFieldQuery(
  fieldName: 'id' | 'name',
  fieldValue: string | number
): QueryWithParams {
  let fromString = '';
  const fromTable = fieldName === 'id' ? 'artist' : 'IdQuery';

  if (fieldName === 'id') {
    fromString = 'artist ';
  } else {
    fromString = `(
      SELECT * FROM artist WHERE name = ?
    ) AS IdQuery `;
  }

  const artistQuery = `
    SELECT
      id, name, patreonName, e621Name, isPending, isBanned, isRejected,
      GROUP_CONCAT(DISTINCT linkUrl) AS linksString 
    FROM ${fromString}
    LEFT JOIN artistlink ON (artistlink.artistId = ${fromTable}.id)
    ${fieldName === 'id' ? 'WHERE id = ?' : ''}
  `;

  return {
    query: artistQuery,
    params: [fieldValue],
  };
}

export async function getArtistByField(
  db: D1Database,
  fieldName: 'id' | 'name',
  fieldValue: string | number
): ResultOrNotFoundOrErrorPromise<Artist> {
  const dbStatement = getArtistByFieldQuery(fieldName, fieldValue);

  const dbRes = await queryDb<DbArtist[]>(
    db,
    dbStatement.query,
    dbStatement.params,
    'Artist'
  );
  if (dbRes.isError) {
    return makeDbErrObj(dbRes, `Error getting artist by ${fieldName}`, {
      fieldName,
      fieldValue,
    });
  }

  if (dbRes.result.length === 0) {
    return { notFound: true };
  }
  return {
    result: dbArtistToArtist(dbRes.result[0]),
  };
}

export async function getArtistByComicId(
  db: D1Database,
  comicId: number
): ResultOrNotFoundOrErrorPromise<Artist> {
  const artistQuery = `SELECT
      id, name, patreonName, e621Name, isPending, isBanned, isRejected,
      GROUP_CONCAT(DISTINCT linkUrl) AS linksString 
    FROM artist LEFT JOIN artistlink ON (artistlink.artistId = artist.id)
    WHERE artist.id = (SELECT artist FROM comic WHERE comic.id = ?)
    GROUP BY id, name, patreonName, e621Name, isPending, isBanned, isRejected
    LIMIT 1`;

  const dbRes = await queryDb<DbArtist[]>(
    db,
    artistQuery,
    [comicId],
    'Artist by comic ID'
  );
  if (dbRes.isError) {
    return makeDbErrObj(dbRes, 'Error getting artist by comic id', { comicId });
  }
  if (dbRes.result.length === 0) {
    return { notFound: true };
  }

  const artist: Artist = {
    id: dbRes.result[0].id,
    name: dbRes.result[0].name,
    patreonName: dbRes.result[0].patreonName,
    e621Name: dbRes.result[0].e621Name,
    isPending: dbRes.result[0].isPending === 1,
    isBanned: dbRes.result[0].isBanned === 1,
    isRejected: dbRes.result[0].isRejected === 1,
    links: dbRes.result[0].linksString ? dbRes.result[0].linksString.split(',') : [],
  };

  return { result: artist };
}

function dbArtistToArtist(dbArtist: DbArtist): Artist {
  return {
    id: dbArtist.id,
    name: dbArtist.name,
    patreonName: dbArtist.patreonName,
    e621Name: dbArtist.e621Name,
    isPending: dbArtist.isPending === 1,
    isBanned: dbArtist.isBanned === 1,
    isRejected: dbArtist.isRejected === 1,
    links: dbArtist.linksString ? dbArtist.linksString.split(',') : [],
  };
}
