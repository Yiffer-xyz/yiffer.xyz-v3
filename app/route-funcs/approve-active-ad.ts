import { queryDbExec } from '~/utils/database-facade';
import type { ApiError } from '~/utils/request-helpers';
import { makeDbErr } from '~/utils/request-helpers';

export async function approveActiveAd(
  db: D1Database,
  adId: string
): Promise<ApiError | undefined> {
  const query = 'UPDATE advertisement SET isChangedWhileActive = 0 WHERE id = ?';

  const dbRes = await queryDbExec(db, query, [adId], 'Ad approval');
  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error getting latest blog');
  }
}
