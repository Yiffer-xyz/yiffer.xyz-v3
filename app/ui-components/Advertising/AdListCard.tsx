import type { Advertisement } from '~/types/types';
import Ad from '~/ui-components/Advertising/Ad';
import AdStatusText from '~/ui-components/Advertising/AdStatusText';
import Link from '~/ui-components/Link';
import { capitalizeFirstRestLower } from '~/utils/general';
import AdComicCard from './AdComicCard';

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
  const bgColor =
    showFullAdminData && ad.isChangedWhileActive
      ? 'bg-theme1-primaryTrans'
      : 'bg-white dark:bg-gray-300';

  return (
    <div
      className={`flex flex-row flex-wrap shadow rounded-sm gap-y-1 px-3 py-3
        gap-6 justify-between ${bgColor}`}
      key={ad.id}
    >
      <div className="flex flex-col gap-y-1 justify-between">
        <div className="w-full flex flex-row justify-between items-center gap-6">
          <Link
            href={`${frontendAdsPath}/${ad.id}`}
            text={`${ad.adName}`}
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
          <p className="text-sm">{capitalizeFirstRestLower(ad.adType)}</p>
          <p className="text-sm">
            {ad.numDaysActive} active days
            {ad.numDaysActive !== ad.currentDaysActive
              ? ` (${ad.currentDaysActive} current)`
              : ''}
          </p>
        </div>

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

        <Link href={ad.link} newTab className="text-sm" text={ad.link} />

        {showFullAdminData && (
          <p className="text-sm break-all">
            {ad.user.username} ・ {ad.user.email} ・ {ad.id}
          </p>
        )}
      </div>

      {(ad.adType === 'banner' || ad.adType === 'topSmall') && (
        <div style={{ width: 300 }}>
          <Ad ad={ad} adsPath={adMediaPath} bypassCache />
        </div>
      )}

      {ad.adType === 'card' && (
        <AdComicCard ad={ad} minimal adsPath={adMediaPath} bypassCache />
      )}
    </div>
  );
}
