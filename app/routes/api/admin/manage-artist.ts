import { queryDbDirect } from '~/utils/database-facade';
import { randomString } from '~/utils/general';
import { getComicsByArtistId } from '../funcs/get-comics';

export async function rejectArtistIfEmpty(
  urlBase: string,
  artistId: number,
  artistName: string
): Promise<{ isEmpty: boolean }> {
  const comics = await getComicsByArtistId(urlBase, artistId);
  if (comics.length > 0) return { isEmpty: false };

  const randomStr = randomString(6);
  const newArtistName = `${artistName}-REJECTED-${randomStr}`;

  const rejectQuery = `UPDATE artist SET name = ?, isRejected = 1 WHERE id = ?`;
  await queryDbDirect(urlBase, rejectQuery, [newArtistName, artistId]);

  return { isEmpty: true };
}

export async function setArtistNotPending(urlBase: string, artistId: number) {
  const updateQuery = `UPDATE artist SET isPending = 0 WHERE id = ?`;
  await queryDbDirect(urlBase, updateQuery, [artistId]);
}
