import { differenceInDays } from 'date-fns';
import type {
  AdStatus,
  AdType,
  Advertisement,
  AdvertisementFullData,
} from '~/types/types';
import { queryDb, queryDbMultiple } from '~/utils/database-facade';
import { parseDbDateStr } from '~/utils/date-utils';
import type {
  ResultOrErrorPromise,
  ResultOrNotFoundOrErrorPromise,
} from '~/utils/request-helpers';
import { makeDbErrObj } from '~/utils/request-helpers';

type DbAd = Omit<
  Advertisement,
  | 'user'
  | 'isChangedWhileActive'
  | 'expiryDate'
  | 'createdDate'
  | 'lastActivationDate'
  | 'isFromOldSystem'
> & {
  userId: number;
  username: string;
  email: string;
  isChangedWhileActive: 0 | 1;
  expiryDate: string;
  createdDate: string;
  lastActivationDate: string;
  isFromOldSystem: 0 | 1;
};

type GetAdsProps = {
  db: D1Database;
  statusFilter?: AdStatus[];
  typeFilter?: AdType[];
  userId?: number;
};

export async function getAds({
  db,
  statusFilter,
  typeFilter,
  userId,
}: GetAdsProps): ResultOrErrorPromise<Advertisement[]> {
  const logCtx = { statusFilter, typeFilter };

  let getAdsQuery = `
    SELECT
      advertisement.id, adType, mediaType, adName, link, mainText, secondaryText, userId,
      username, email, status, isAnimated, expiryDate, createdDate, advertiserNotes,
      adminNotes, correctionNote, freeTrialState, lastActivationDate, numDaysActive,
      isChangedWhileActive, videoSpecificFileType, isFromOldSystem,
      COALESCE(SUM(advertisementdayclick.clicks), 0) AS clicks,
      COALESCE(SUM(advertisementdayclick.impressions), 0) AS impressions,
      COALESCE(SUM(advertisementdayclick.impressionsSrv), 0) AS impressionsSrv
    FROM advertisement
    INNER JOIN user ON (user.id = advertisement.userId)
    LEFT JOIN advertisementdayclick ON (advertisementdayclick.adId = advertisement.id)`;

  const params: any[] = [];

  let statusFilterStr = '';
  let typeFilterStr = '';

  if (statusFilter && statusFilter.length > 0) {
    statusFilterStr = `status IN (${statusFilter.map(() => '?').join(',')})`;
    params.push(...statusFilter);
  }

  if (typeFilter && typeFilter.length > 0) {
    typeFilterStr = `adType IN (${typeFilter.map(() => '?').join(',')})`;
    params.push(...typeFilter);
  }

  const userIdFilterStr = userId ? 'advertisement.userId = ?' : '';
  if (userId) params.push(userId);

  const whereClause = [statusFilterStr, typeFilterStr, userIdFilterStr]
    .filter(Boolean)
    .join(' AND ');

  if (whereClause) {
    getAdsQuery += ` WHERE ${whereClause}`;
  }

  getAdsQuery += ' GROUP BY advertisement.id';

  const adsRes = await queryDb<DbAd[]>(db, getAdsQuery, params, 'Ads');

  if (adsRes.isError) {
    return makeDbErrObj(adsRes, 'Could not get ads', logCtx);
  }

  return { result: adsRes.result.map(DbAdToFullAd) };
}

type GetAdByIdProps = {
  db: D1Database;
  adId: string;
  includeDetailedStats?: boolean;
};

export async function getAdById({
  db,
  adId,
  includeDetailedStats,
}: GetAdByIdProps): ResultOrNotFoundOrErrorPromise<AdvertisementFullData> {
  const logCtx = { adId };

  const getAdQuery = `
    SELECT
      advertisement.id, adType, mediaType, adName, link, mainText, secondaryText, userId,
      username, email, status, isAnimated, expiryDate, createdDate, advertiserNotes,
      adminNotes, correctionNote, freeTrialState, lastActivationDate, numDaysActive,
      isChangedWhileActive, videoSpecificFileType, isFromOldSystem,
      COALESCE(SUM(advertisementdayclick.clicks), 0) AS clicks,
      COALESCE(SUM(advertisementdayclick.impressions), 0) AS impressions,
      COALESCE(SUM(advertisementdayclick.impressionsSrv), 0) AS impressionsSrv
    FROM advertisement
    INNER JOIN user ON (user.id = advertisement.userId)
    LEFT JOIN advertisementdayclick ON (advertisementdayclick.adId = advertisement.id)
    WHERE advertisement.id = ?
    GROUP BY advertisement.id
  `;

  const getAdPaymentsQuery =
    'SELECT amount, registeredDate FROM advertisementpayment WHERE adId = ?';

  const getClickStatsQuery =
    'SELECT date, clicks FROM advertisementdayclick WHERE adId = ?';

  let adRes: DbAd[] = [];
  let payments: { amount: number; registeredDate: string }[] = [];
  let clicks: { date: string; clicks: number }[] = [];

  if (includeDetailedStats) {
    const queries = [
      { query: getAdQuery, params: [adId], queryName: 'Ad by ID' },
      { query: getAdPaymentsQuery, params: [adId], queryName: 'Ad payments' },
      { query: getClickStatsQuery, params: [adId], queryName: 'Ad clicks' },
    ];

    const dbRes = await queryDbMultiple<
      [
        DbAd[],
        { amount: number; registeredDate: string }[],
        { date: string; clicks: number }[],
      ]
    >(db, queries);

    if (dbRes.isError) {
      return makeDbErrObj(dbRes, 'Error getting ad by ID', logCtx);
    }

    [adRes, payments, clicks] = dbRes.result;
  } else {
    const dbRes = await queryDb<DbAd[]>(db, getAdQuery, [adId], 'Ad by ID');
    if (dbRes.isError) {
      return makeDbErrObj(dbRes, 'Error getting ad by ID', logCtx);
    }

    adRes = dbRes.result;
  }

  if (adRes.length === 0) {
    return { notFound: true };
  }

  const paymentsMapped = payments.map(({ amount, registeredDate }) => ({
    amount,
    registeredDate: parseDbDateStr(registeredDate),
  }));
  const clicksMapped = clicks.map(({ date, clicks }) => ({
    date: parseDbDateStr(date),
    clicks,
  }));

  return {
    result: {
      ad: DbAdToFullAd(adRes[0]),
      payments: paymentsMapped,
      clicks: clicksMapped,
    },
  };
}

function DbAdToFullAd(ad: DbAd): Advertisement {
  let totalDaysActive = ad.numDaysActive;
  let currentDaysActive = 0;
  if (ad.status === 'ACTIVE' && ad.lastActivationDate) {
    const today = new Date();
    const lastActivationDate = parseDbDateStr(ad.lastActivationDate);
    currentDaysActive = differenceInDays(today, lastActivationDate);
    totalDaysActive += currentDaysActive + 1;
  }

  return {
    id: ad.id,
    adType: ad.adType,
    mediaType: ad.mediaType,
    adName: ad.adName,
    link: ad.link,
    mainText: ad.mainText,
    secondaryText: ad.secondaryText,
    user: {
      id: ad.userId,
      username: ad.username,
      email: ad.email,
    },
    status: ad.status,
    isAnimated: ad.isAnimated,
    expiryDate: ad.expiryDate ? parseDbDateStr(ad.expiryDate) : undefined,
    createdDate: parseDbDateStr(ad.createdDate),
    advertiserNotes: ad.advertiserNotes,
    clicks: ad.clicks,
    impressions: ad.impressions,
    clickRate: Math.round(
      (ad.impressions === 0 || ad.clicks === 0 ? 0 : ad.clicks / ad.impressions) * 100
    ),
    impressionsSrv: ad.impressionsSrv,
    clickRateSrv: Math.round(
      (ad.impressionsSrv === 0 || ad.clicks === 0 ? 0 : ad.clicks / ad.impressionsSrv) *
        100
    ),
    adminNotes: ad.adminNotes,
    correctionNote: ad.correctionNote,
    freeTrialState: ad.freeTrialState,
    lastActivationDate: ad.lastActivationDate
      ? parseDbDateStr(ad.lastActivationDate)
      : undefined,
    numDaysActive: totalDaysActive,
    currentDaysActive,
    clicksPerDayActive:
      totalDaysActive === 0 ? 0 : Math.round(10 * (ad.clicks / totalDaysActive)) / 10,
    isChangedWhileActive: ad.isChangedWhileActive === 1,
    videoSpecificFileType: ad.videoSpecificFileType,
    isFromOldSystem: ad.isFromOldSystem === 1,
  };
}
