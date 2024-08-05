import type { Advertisement } from '~/types/types';
import Ad from '~/ui-components/Ad/Ad';
import AdStatusText from '~/ui-components/AdStatus/AdStatusText';
import Link from '~/ui-components/Link';
import { capitalizeFirstRestLower } from '~/utils/general';
import AdComicCard from '../browse/AdComicCard';

export default function AdminAdCard({
  ad,
  adsPath,
}: {
  ad: Advertisement;
  adsPath: string;
}) {
  const bgColor = ad.isChangedWhileActive
    ? 'bg-theme1-primaryTrans'
    : 'bg-white dark:bg-gray-300';

  return (
    <div
      className={`flex flex-row flex-wrap shadow rounded-sm gap-y-1 px-3 py-3
        gap-6 justify-between ${bgColor}`}
      key={ad.id}
    >
      <div className="flex flex-col gap-y-1">
        <div className="w-full flex flex-row justify-between items-center gap-6">
          <Link
            href={`/admin/advertising/${ad.id}`}
            text={`${ad.adName}`}
            showRightArrow
            className="whitespace-pre-wrap"
          />

          <AdStatusText status={ad.status} small />
        </div>

        {ad.isChangedWhileActive && (
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

        {ad.clicks > 0 && (
          <p className="text-sm">
            <span className="font-semibold">{ad.clicksPerDayActive}</span> per day ・{' '}
            {ad.clicks} total ・ <span className="font-semibold">{ad.clickRateSrv}%</span>{' '}
            click rate
          </p>
        )}

        <Link href={ad.link} newTab className="text-sm" text={ad.link} />

        <p className="text-sm break-all">
          {ad.user.username} ・ {ad.user.email} ・ {ad.id}
        </p>
      </div>
      {(ad.adType === 'banner' || ad.adType === 'topSmall') && (
        <div style={{ width: 300 }}>
          <Ad ad={ad} adsPath={adsPath} bypassCache />
        </div>
      )}

      {ad.adType === 'card' && (
        <AdComicCard ad={ad} minimal adsPath={adsPath} bypassCache />
      )}
    </div>
  );
}
