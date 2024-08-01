import { differenceInDays } from 'date-fns';
import type { AdStatus, AdType, Advertisement } from '~/types/types';
import { queryDb, queryDbMultiple } from '~/utils/database-facade';
import type {
  ResultOrErrorPromise,
  ResultOrNotFoundOrErrorPromise,
} from '~/utils/request-helpers';
import { makeDbErrObj } from '~/utils/request-helpers';

type DbAd = Omit<Advertisement, 'user'> & {
  userId: number;
  username: string;
  email: string;
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
      advertisement.id, adType, adName, link, mainText, secondaryText, userId,
      username, email, status, isAnimated, expiryDate, createdDate, advertiserNotes,
      clicks, adminNotes, correctionNote, freeTrialState, lastActivationDate, numDaysActive
    FROM advertisement
    INNER JOIN user ON (user.id = advertisement.userId)`;

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

  const adsRes = await queryDb<DbAd[]>(db, getAdsQuery, params);

  if (adsRes.isError) {
    return makeDbErrObj(adsRes, 'Could not get ads', logCtx);
  }

  return { result: adsRes.result.map(DbAdToFullAd) };
}

export async function getAdById(
  db: D1Database,
  adId: string
): ResultOrNotFoundOrErrorPromise<{
  ad: Advertisement;
  payments: { amount: number; registeredDate: string }[];
}> {
  const logCtx = { adId };

  const getAdQuery = `
    SELECT
      advertisement.id, adType, adName, link, mainText, secondaryText, userId,
      username, email, status, isAnimated, expiryDate, createdDate, advertiserNotes,
      clicks, adminNotes, correctionNote, freeTrialState, lastActivationDate, numDaysActive
    FROM advertisement
    INNER JOIN user ON (user.id = advertisement.userId)
    WHERE advertisement.id = ?
  `;

  const getAdPaymentsQuery =
    'SELECT amount, registeredDate FROM advertisementpayment WHERE adId = ?';

  const dbRes = await queryDbMultiple<
    [DbAd[], { amount: number; registeredDate: string }[]]
  >(db, [
    { query: getAdQuery, params: [adId] },
    {
      query: getAdPaymentsQuery,
      params: [adId],
    },
  ]);

  if (dbRes.isError) {
    return makeDbErrObj(dbRes, 'Error getting ad by ID', logCtx);
  }

  const [adRes, adPaymentsRes] = dbRes.result;

  if (adRes.length === 0) {
    return { notFound: true };
  }

  return {
    result: {
      ad: DbAdToFullAd(adRes[0]),
      payments: adPaymentsRes,
    },
  };
}

function DbAdToFullAd(ad: DbAd): Advertisement {
  let totalDaysActive = ad.numDaysActive;
  if (ad.status === 'ACTIVE' && ad.lastActivationDate) {
    const today = new Date();
    const lastActivationDate = new Date(ad.lastActivationDate);
    const currentlyActiveDays = differenceInDays(today, lastActivationDate);
    totalDaysActive += currentlyActiveDays + 1;
  }

  return {
    id: ad.id,
    adType: ad.adType,
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
    expiryDate: ad.expiryDate,
    createdDate: ad.createdDate,
    advertiserNotes: ad.advertiserNotes,
    clicks: ad.clicks,
    adminNotes: ad.adminNotes,
    correctionNote: ad.correctionNote,
    freeTrialState: ad.freeTrialState,
    lastActivationDate: ad.lastActivationDate,
    numDaysActive: totalDaysActive,
  };
}
