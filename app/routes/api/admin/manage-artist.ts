import { ComicTiny } from '~/types/types';
import { queryDb } from '~/utils/database-facade';
import { randomString } from '~/utils/general';
import { ApiError, wrapApiError } from '~/utils/request-helpers';
import { getComicsByArtistId } from '../funcs/get-comics';

export async function rejectArtistIfEmpty(
  urlBase: string,
  artistId: number,
  artistName: string
): Promise<{ isEmpty?: boolean; err?: ApiError }> {
  let { comics, err } = await getComicsByArtistId(urlBase, artistId);
  if (err) {
    return { err: wrapApiError(err, 'Error rejecting artist') };
  }
  comics = comics as ComicTiny[];
  if (comics.length > 0) return { isEmpty: false };

  const randomStr = randomString(6);
  const newArtistName = `${artistName}-REJECTED-${randomStr}`;

  const rejectQuery = `UPDATE artist SET name = ?, isRejected = 1 WHERE id = ?`;
  const dbRes = await queryDb(urlBase, rejectQuery, [newArtistName, artistId]);
  if (dbRes.errorMessage) {
    return {
      err: {
        clientMessage: 'Error rejecting artist',
        logMessage: `Error rejecting artist. Name and id: ${artistName}, ${artistId}`,
        error: dbRes,
      },
    };
  }

  return { isEmpty: true };
}

export async function setArtistNotPending(
  urlBase: string,
  artistId: number
): Promise<ApiError | undefined> {
  const updateQuery = `UPDATE artist SET isPending = 0 WHERE id = ?`;
  const dbRes = await queryDb(urlBase, updateQuery, [artistId]);
  if (dbRes.errorMessage) {
    return {
      clientMessage: 'Error setting artist not pending',
      logMessage: `Error setting artist not pending. Artist id: ${artistId}.`,
      error: dbRes,
    };
  }
}
