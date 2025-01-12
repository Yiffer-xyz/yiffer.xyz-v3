import type { Advertisement } from '~/types/types';
import Ad from '~/ui-components/Advertising/Ad';
import AdStatusText from '~/ui-components/Advertising/AdStatusText';
import Link from '~/ui-components/Link';
import { capitalizeFirstRestLower } from '~/utils/general';
import AdComicCard from './AdComicCard';
import { useMemo } from 'react';
import { ADVERTISEMENTS } from '~/types/constants';
import { differenceInDays, format } from 'date-fns';

export default function AdListCard({
  ad,
  adMediaPath,
  frontendAdsPath,
  showFullAdminData,
}: {
  ad: Advertisement;
  adMediaPath: string;
  frontendAdsPath: string;
  showFullAdminData?: boolean;
}) {
  const activeDaysStr = useMemo(() => {
    if (!ad.numDaysActive) return '';
    if (Math.abs(ad.numDaysActive - ad.currentDaysActive) > 2) {
      return `${ad.numDaysActive} active days (${ad.currentDaysActive + 1} current)`;
    }

    return `${ad.currentDaysActive + 1} active days`;
  }, [ad.numDaysActive, ad.currentDaysActive]);

  const bgColor = useMemo(() => {
    if (ad.videoSpecificFileType && showFullAdminData) return 'bg-red-moreTrans';

    return showFullAdminData && ad.isChangedWhileActive
      ? 'bg-theme1-primaryTrans'
      : 'bg-white dark:bg-gray-300';
  }, [ad.videoSpecificFileType, showFullAdminData, ad.isChangedWhileActive]);

  const adTypeInfo = ADVERTISEMENTS.find(adInfo => adInfo.name === ad.adType);

  return (
    <div
      className={`flex flex-col md:flex-row flex-nowrap shadow rounded-sm gap-y-1 px-3 py-3
        gap-6 justify-between ${bgColor}`}
      key={ad.id}
    >
      <div className="flex flex-col gap-y-1 justify-between flex-grow md:flex-grow-0">
        <div className="w-full flex flex-row justify-between items-center gap-6">
          <Link
            href={`${frontendAdsPath}/${ad.id}`}
            text={`${ad.adName} (${ad.id})`}
            showRightArrow
            className="whitespace-pre-wrap"
          />

          <AdStatusText status={ad.status} small={showFullAdminData} />
        </div>

        {ad.isChangedWhileActive && showFullAdminData && (
          <span className="font-bold">
            <p>Edited while active, needs review</p>
          </span>
        )}

        <div className="w-full flex flex-row justify-between items-center gap-6">
          <p className="text-sm">
            {adTypeInfo?.shortTitle} ・ {capitalizeFirstRestLower(ad.mediaType)}
          </p>
          {ad.numDaysActive > 0 && <p className="text-sm">{activeDaysStr}</p>}
        </div>

        {ad.expiryDate && (
          <p className="text-sm">
            Expires {format(ad.expiryDate, 'PPP')} (in{' '}
            {differenceInDays(ad.expiryDate, new Date())} days)
          </p>
        )}

        {ad.clicks > 0 && showFullAdminData && (
          <p className="text-sm">
            <span className="font-semibold">{ad.clicksPerDayActive}</span> per day ・{' '}
            {ad.clicks} total ・ <span className="font-semibold">{ad.clickRateSrv}%</span>{' '}
            click rate
          </p>
        )}

        {ad.clicks > 0 && !showFullAdminData && (
          <p className="text-sm">{ad.clicks} clicks</p>
        )}

        <Link
          href={ad.link}
          newTab
          className="text-sm"
          text={ad.link}
          style={{ lineBreak: 'anywhere' }}
        />

        {showFullAdminData && (
          <p className="text-sm break-all">
            <Link
              href={`/admin/users/${ad.user.id}`}
              text={ad.user.username}
              showRightArrow
              isInsideParagraph
            />{' '}
            ・ {ad.user.email} ・ {ad.id}
          </p>
        )}

        {showFullAdminData && ad.videoSpecificFileType && (
          <p className="text-sm text-red-strong-100 font-semibold">{ad.mediaType} only</p>
        )}
      </div>

      {(ad.adType === 'banner' || ad.adType === 'topSmall') && (
        <div style={{ width: 300 }}>
          <Ad ad={ad} adsPath={adMediaPath} bypassCache overrideWidth={300} />
        </div>
      )}

      {ad.adType === 'card' && (
        <AdComicCard ad={ad} minimal adsPath={adMediaPath} bypassCache />
      )}
    </div>
  );
}
