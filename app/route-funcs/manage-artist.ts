import { queryDbExec } from '~/utils/database-facade';
import { randomString } from '~/utils/general';
import type { ApiError, ResultOrErrorPromise } from '~/utils/request-helpers';
import { makeDbErr, makeDbErrObj, wrapApiError } from '~/utils/request-helpers';
import { getComicsByArtistField } from './get-comics';

export async function rejectArtistIfEmpty(
  db: D1Database,
  artistId: number,
  artistName: string
): ResultOrErrorPromise<{ isEmpty: boolean }> {
  const comicsRes = await getComicsByArtistField(db, 'id', artistId);
  if (comicsRes.err) {
    return { err: wrapApiError(comicsRes.err, 'Error rejecting artist', { artistId }) };
  }
  if (comicsRes.result.length > 0) return { result: { isEmpty: false } };

  const randomStr = randomString(6);
  const newArtistName = `${artistName}-REJECTED-${randomStr}`;

  const rejectQuery = `UPDATE artist SET name = ?, isRejected = 1 WHERE id = ?`;
  const dbRes = await queryDbExec(
    db,
    rejectQuery,
    [newArtistName, artistId],
    'Artist rejection'
  );
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
  db: D1Database,
  artistId: number
): Promise<ApiError | undefined> {
  const updateQuery = `UPDATE artist SET isPending = 0 WHERE id = ?`;
  const dbRes = await queryDbExec(db, updateQuery, [artistId], 'Artist, set not pending');
  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error setting artist not pending', { artistId });
  }
}
