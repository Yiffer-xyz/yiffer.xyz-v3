import { queryDbExec } from '~/utils/database-facade';
import type { ApiError } from '~/utils/request-helpers';
import { makeDbErr } from '~/utils/request-helpers';

export async function logAdImpression({
  db,
  adId,
  isServerSide,
}: {
  db: D1Database;
  adId: string;
  isServerSide: boolean;
}): Promise<ApiError | undefined> {
  const logCtx = { adId, isServerSide };

  const column = isServerSide ? 'impressionsSrv' : 'impressions';
  const query = `INSERT INTO advertisementdayclick (adId, date, ${column}) VALUES (?, ?, ?)
  ON CONFLICT (adId, date) DO UPDATE SET ${column} = advertisementdayclick.${column} + 1`;

  const date = new Date().toISOString().split('T')[0];
  const params = [adId, date, 1];

  const res = await queryDbExec(db, query, params, 'Ad impression logging');

  if (res.isError) {
    return makeDbErr(res, 'Could not log ad impression', logCtx);
  }
}
