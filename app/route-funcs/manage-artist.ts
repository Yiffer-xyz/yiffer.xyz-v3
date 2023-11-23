import type { ComicTiny } from '~/types/types';
import { queryDb } from '~/utils/database-facade';
import { randomString } from '~/utils/general';
import type { ApiError } from '~/utils/request-helpers';
import { makeDbErr, makeDbErrObj, wrapApiError } from '~/utils/request-helpers';
import { getComicsByArtistId } from './get-comics';

export async function rejectArtistIfEmpty(
  urlBase: string,
  artistId: number,
  artistName: string
): Promise<{ isEmpty?: boolean; err?: ApiError }> {
  let { comics, err } = await getComicsByArtistId(urlBase, artistId);
  if (err) {
    return { err: wrapApiError(err, 'Error rejecting artist', { artistId }) };
  }
  comics = comics as ComicTiny[];
  if (comics.length > 0) return { isEmpty: false };

  const randomStr = randomString(6);
  const newArtistName = `${artistName}-REJECTED-${randomStr}`;

  const rejectQuery = `UPDATE artist SET name = ?, isRejected = 1 WHERE id = ?`;
  const dbRes = await queryDb(urlBase, rejectQuery, [newArtistName, artistId]);
  if (dbRes.isError) {
    return makeDbErrObj(dbRes, 'Error rejecting artist', {
      artistId,
      artistName,
      newArtistName,
    });
  }

  return { isEmpty: true };
}

export async function setArtistNotPending(
  urlBase: string,
  artistId: number
): Promise<ApiError | undefined> {
  const updateQuery = `UPDATE artist SET isPending = 0 WHERE id = ?`;
  const dbRes = await queryDb(urlBase, updateQuery, [artistId]);
  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error setting artist not pending', { artistId });
  }
}
