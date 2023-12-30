import type { AdStatus, AdType, Advertisement } from '~/types/types';
import { queryDb } from '~/utils/database-facade';
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

export async function getAllAds(
  urlBase: string,
  statusFilter: AdStatus[],
  typeFilter: AdType[]
): ResultOrErrorPromise<Advertisement[]> {
  const logCtx = { statusFilter, typeFilter };

  const getAdsQuery = `
    SELECT
      advertisement.id, adType, adName, link, mainText, secondaryText, userId,
      username, email, status, filetype, expiryDate, createdDate, advertiserNotes,
      clicks, adminNotes, correctionNote
    FROM advertisement
    INNER JOIN user ON (user.id = advertisement.userId)
    WHERE status IN (${statusFilter.map(() => '?').join(',')})
      AND adType IN (${typeFilter.map(() => '?').join(',')})
  `;

  const adsRes = await queryDb<DbAd[]>(urlBase, getAdsQuery, [
    ...statusFilter,
    ...typeFilter,
  ]);

  if (adsRes.isError) {
    return makeDbErrObj(adsRes, 'Could not get ads', logCtx);
  }

  return { result: adsRes.result.map(DbAdToFullAd) };
}

export async function getAdById(
  urlBase: string,
  adId: string
): ResultOrNotFoundOrErrorPromise<{
  ad: Advertisement;
  payments: { amount: number; registeredDate: string }[];
}> {
  const logCtx = { adId };

  const getAdQuery = `
    SELECT
      advertisement.id, adType, adName, link, mainText, secondaryText, userId,
      username, email, status, filetype, expiryDate, createdDate, advertiserNotes,
      clicks, adminNotes, correctionNote
    FROM advertisement
    INNER JOIN user ON (user.id = advertisement.userId)
    WHERE advertisement.id = ?
  `;

  const getAdPaymentsQuery =
    'SELECT amount, registeredDate FROM advertisementpayment WHERE adId = ?';

  const adResPromise = queryDb<DbAd[]>(urlBase, getAdQuery, [adId]);
  const adPaymentsResPromise = queryDb<{ amount: number; registeredDate: string }[]>(
    urlBase,
    getAdPaymentsQuery,
    [adId]
  );

  const [adRes, adPaymentsRes] = await Promise.all([adResPromise, adPaymentsResPromise]);

  if (adRes.isError || !adRes.result) {
    return makeDbErrObj(adRes, 'Could not get ad', logCtx);
  }
  if (adPaymentsRes.isError || !adPaymentsRes.result) {
    return makeDbErrObj(adPaymentsRes, 'Could not get ad payments', logCtx);
  }
  if (adRes.result.length === 0) {
    return { notFound: true };
  }

  return {
    result: {
      ad: DbAdToFullAd(adRes.result[0]),
      payments: adPaymentsRes.result,
    },
  };
}

function DbAdToFullAd(ad: DbAd): Advertisement {
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
    filetype: ad.filetype,
    expiryDate: ad.expiryDate,
    createdDate: ad.createdDate,
    advertiserNotes: ad.advertiserNotes,
    clicks: ad.clicks,
    adminNotes: ad.adminNotes,
    correctionNote: ad.correctionNote,
  };
}
