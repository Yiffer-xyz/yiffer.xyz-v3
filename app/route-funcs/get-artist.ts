import type { Artist } from '~/types/types';
import { queryDb } from '~/utils/database-facade';
import type { ApiError } from '~/utils/request-helpers';
import { makeDbErrObj } from '~/utils/request-helpers';

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

export async function getArtistById(
  urlBase: string,
  artistId: number
): Promise<{ artist?: Artist; notFound?: boolean; err?: ApiError }> {
  const artistQuery = `
    SELECT
      id, name, patreonName, e621Name, isPending, isBanned, isRejected,
      GROUP_CONCAT(DISTINCT linkUrl SEPARATOR ',') AS linksString 
    FROM artist LEFT JOIN artistlink ON (artistlink.artistId = artist.id)
    WHERE id = ?`;

  const dbRes = await queryDb<DbArtist[]>(urlBase, artistQuery, [artistId]);
  if (dbRes.isError) {
    return makeDbErrObj(dbRes, 'Error getting artist', { artistId });
  }

  if (!dbRes.result || dbRes.result.length === 0) {
    return { notFound: true };
  }
  return {
    artist: {
      id: dbRes.result[0].id,
      name: dbRes.result[0].name,
      patreonName: dbRes.result[0].patreonName,
      e621Name: dbRes.result[0].e621Name,
      isPending: dbRes.result[0].isPending === 1,
      isBanned: dbRes.result[0].isBanned === 1,
      isRejected: dbRes.result[0].isRejected === 1,
      links: dbRes.result[0].linksString ? dbRes.result[0].linksString.split(',') : [],
    },
  };
}

export async function getArtistByComicId(
  urlBase: string,
  comicId: number
): Promise<
  | { err: ApiError }
  | { notFound: true; err?: undefined }
  | { artist: Artist; notFound?: undefined; err?: undefined }
> {
  const artistQuery = `SELECT
      id, name, patreonName, e621Name, isPending, isBanned, isRejected,
      GROUP_CONCAT(DISTINCT linkUrl SEPARATOR ',') AS linksString 
    FROM artist LEFT JOIN artistlink ON (artistlink.artistId = artist.id)
    WHERE artist.id = (SELECT artist FROM comic WHERE comic.id = ?)
    GROUP BY id, name, patreonName, e621Name, isPending, isBanned, isRejected`;

  const dbRes = await queryDb<DbArtist[]>(urlBase, artistQuery, [comicId]);
  if (dbRes.isError) {
    return makeDbErrObj(dbRes, 'Error getting artist by comic id', { comicId });
  }
  if (!dbRes.result || dbRes.result.length === 0) {
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

  return { artist };
}