import { queryDb } from '~/utils/database-facade';
import { randomString } from '~/utils/general';
import type { ApiError, ResultOrErrorPromise } from '~/utils/request-helpers';
import { makeDbErr, makeDbErrObj, wrapApiError } from '~/utils/request-helpers';
import { getComicsByArtistId } from './get-comics';

export async function rejectArtistIfEmpty(
  urlBase: string,
  artistId: number,
  artistName: string
): ResultOrErrorPromise<{ isEmpty: boolean }> {
  const comicsRes = await getComicsByArtistId(urlBase, artistId);
  if (comicsRes.err) {
    return { err: wrapApiError(comicsRes.err, 'Error rejecting artist', { artistId }) };
  }
  if (comicsRes.result.length > 0) return { result: { isEmpty: false } };

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

  return { result: { isEmpty: true } };
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
