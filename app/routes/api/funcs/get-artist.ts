import { Artist } from '~/types/types';
import { queryDbDirect } from '~/utils/database-facade';

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

export async function getArtistById(urlBase: string, artistId: number): Promise<Artist> {
  const artistQuery = `
    SELECT
      id, name, patreonName, e621Name, isPending, isBanned, isRejected,
      GROUP_CONCAT(DISTINCT linkUrl SEPARATOR ',') AS linksString 
    FROM artist LEFT JOIN artistlink ON (artistlink.artistId = artist.id)
    WHERE id = ?`;

  const artistResult = await queryDbDirect<DbArtist[]>(urlBase, artistQuery, [artistId]);
  if (!artistResult || artistResult.length === 0) throw new Error('Artist not found');

  return {
    id: artistResult[0].id,
    name: artistResult[0].name,
    patreonName: artistResult[0].patreonName,
    e621Name: artistResult[0].e621Name,
    isPending: artistResult[0].isPending === 1,
    isBanned: artistResult[0].isBanned === 1,
    isRejected: artistResult[0].isRejected === 1,
    links: artistResult[0].linksString ? artistResult[0].linksString.split(',') : [],
  };
}

export async function getArtistByComicId(
  urlBase: string,
  comicId: number
): Promise<Artist> {
  const artistQuery = `SELECT
      id, name, patreonName, e621Name, isPending, isBanned, isRejected,
      GROUP_CONCAT(DISTINCT linkUrl SEPARATOR ',') AS linksString 
    FROM artist LEFT JOIN artistlink ON (artistlink.artistId = artist.id)
    WHERE artist.id = (SELECT artist FROM comic WHERE comic.id = ?)
    GROUP BY id, name, patreonName, e621Name, isPending, isBanned, isRejected`;

  const artistResult = await queryDbDirect<DbArtist[]>(urlBase, artistQuery, [comicId]);
  if (!artistResult || artistResult.length === 0) throw new Error('Artist not found');

  return {
    id: artistResult[0].id,
    name: artistResult[0].name,
    patreonName: artistResult[0].patreonName,
    e621Name: artistResult[0].e621Name,
    isPending: artistResult[0].isPending === 1,
    isBanned: artistResult[0].isBanned === 1,
    isRejected: artistResult[0].isRejected === 1,
    links: artistResult[0].linksString ? artistResult[0].linksString.split(',') : [],
  };
}
