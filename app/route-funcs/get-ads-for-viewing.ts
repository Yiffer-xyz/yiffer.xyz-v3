import type { AdForViewing, AdType } from '~/types/types';
import { queryDb } from '~/utils/database-facade';
import type { ResultOrErrorPromise } from '~/utils/request-helpers';
import { makeDbErrObj } from '~/utils/request-helpers';
import { logAdImpression } from './log-ad-impression';

export async function getAdForViewing({
  db,
  adType,
}: {
  db: D1Database;
  adType: AdType;
}): ResultOrErrorPromise<AdForViewing | null> {
  const logCtx = { adType };

  const getAdsQuery = `
    SELECT id, link, isAnimated, adType
    FROM advertisement
    WHERE status = 'ACTIVE' AND adType = ?
    ORDER BY RANDOM() LIMIT 1`;

  const params = [adType];

  const adsRes = await queryDb<AdForViewing[]>(db, getAdsQuery, params);

  if (adsRes.isError) {
    return makeDbErrObj(adsRes, 'Could not get ads', logCtx);
  }

  if (adsRes.result.length === 0) {
    return { result: null };
  }

  logAdImpression({ db, adId: adsRes.result[0].id, isServerSide: true });
  return { result: adsRes.result[0] };
}
