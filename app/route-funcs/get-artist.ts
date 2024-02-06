import type { Artist, ComicTiny } from '~/types/types';
import type { DBInputWithErrMsg } from '~/utils/database-facade';
import { queryDb, queryDbMultiple } from '~/utils/database-facade';
import type { ResultOrNotFoundOrErrorPromise } from '~/utils/request-helpers';
import { makeDbErrObj } from '~/utils/request-helpers';
import { addStateToComicNames, getComicsByArtistFieldQuery } from './get-comics';

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
  fieldValue: string | number
): ResultOrNotFoundOrErrorPromise<{
  artist: Artist;
  comics: ComicTiny[];
}> {
  const dbStatements = [
    getArtistByFieldQuery(fieldName, fieldValue),
    getComicsByArtistFieldQuery(fieldName, fieldValue),
  ];

  const dbRes = await queryDbMultiple<[DbArtist[], ComicTiny[]]>(
    db,
    dbStatements,
    'Error getting artist and comics by field'
  );
  if (dbRes.isError) {
    return makeDbErrObj(dbRes, dbRes.errorMessage, { fieldName, fieldValue });
  }

  if (dbRes.result[0].length === 0) {
    return { notFound: true };
  }

  return {
    result: {
      artist: dbArtistToArtist(dbRes.result[0][0]),
      comics: addStateToComicNames(dbRes.result[1]),
    },
  };
}

export function getArtistByFieldQuery(
  fieldName: 'id' | 'name',
  fieldValue: string | number
): DBInputWithErrMsg {
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
    errorLogMessage: `Error getting artist by ${fieldName}`,
  };
}

export async function getArtistByField(
  db: D1Database,
  fieldName: 'id' | 'name',
  fieldValue: string | number
): ResultOrNotFoundOrErrorPromise<Artist> {
  const dbStatement = getArtistByFieldQuery(fieldName, fieldValue);

  const dbRes = await queryDb<DbArtist[]>(db, dbStatement.query, dbStatement.params);
  if (dbRes.isError) {
    return makeDbErrObj(dbRes, 'Error getting artist by field', {
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

  const dbRes = await queryDb<DbArtist[]>(db, artistQuery, [comicId]);
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
