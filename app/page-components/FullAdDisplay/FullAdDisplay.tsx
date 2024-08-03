import { format } from 'date-fns';
import { useMemo } from 'react';
import AdClickStats from '~/routes/advertising_.dashboard_.$adId/AdClickStats';
import AdComicCard from '~/routes/browse/AdComicCard';
import { ADVERTISEMENTS } from '~/types/constants';
import type { AdvertisementFullData } from '~/types/types';
import AdStatusText from '~/ui-components/AdStatus/AdStatusText';
import Link from '~/ui-components/Link';
import { Table, TableBody, TableCell, TableRow } from '~/ui-components/Table';
import { capitalizeString } from '~/utils/general';

type Props = {
  adData: AdvertisementFullData;
  adsPath: string;
  detailedTableStats?: boolean;
};

export default function FullAdDisplay({ adData, adsPath, detailedTableStats }: Props) {
  const ad = adData?.ad;
  const shouldShowPayments = ad && (adData.payments.length > 0 || ad.status === 'ACTIVE');

  const displayedAd = useMemo(() => {
    if (!ad) return null;

    if (ad.adType === 'card') {
      return <AdComicCard ad={ad} adsPath={adsPath} className="h-fit" />;
    }
    const width = ad.adType === 'banner' ? 364 : 300;
    const height = ad.adType === 'banner' ? 45 : 90;
    return (
      <img
        src={`${adsPath}/${ad.id}-2x.jpg`}
        style={{ maxWidth: width, maxHeight: height, width: 'auto', height: 'auto' }}
        width={width}
        height={height}
        alt="Ad"
      />
    );
  }, [ad, adsPath]);

  return (
    <>
      <h3 className="mt-4 mb-1">Details</h3>

      <div className="flex flex-row flex-wrap gap-x-8 gap-y-4">
        <Table>
          <TableBody>
            <TableRow includeBorderTop>
              <TableCell className="font-semibold">Name</TableCell>
              <TableCell>{ad.adName}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-semibold">ID</TableCell>
              <TableCell>{ad.id}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-semibold">Type</TableCell>
              <TableCell>
                {ADVERTISEMENTS.find(a => a.name === ad.adType)?.title}
              </TableCell>
            </TableRow>
            {detailedTableStats && (
              <TableRow>
                <TableCell className="font-semibold">Status</TableCell>
                <TableCell>
                  <AdStatusText status={ad.status} />
                </TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell className="font-semibold">Link</TableCell>
              <TableCell>
                <Link href={ad.link} text={ad.link} newTab />
              </TableCell>
            </TableRow>
            {ad.freeTrialState && (
              <TableRow>
                <TableCell className="font-semibold">Free trial</TableCell>
                <TableCell>{capitalizeString(ad.freeTrialState)}</TableCell>
              </TableRow>
            )}
            {ad.mainText && (
              <TableRow>
                <TableCell className="font-semibold">Main text</TableCell>
                <TableCell>{ad.mainText}</TableCell>
              </TableRow>
            )}
            {ad.secondaryText && (
              <TableRow>
                <TableCell className="font-semibold">Secondary text</TableCell>
                <TableCell>{ad.secondaryText}</TableCell>
              </TableRow>
            )}
            {ad.expiryDate && (
              <TableRow>
                <TableCell className="font-semibold">Expiry date</TableCell>
                <TableCell>{format(new Date(ad.expiryDate), 'PPP')}</TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell className="font-semibold">Created</TableCell>
              <TableCell>{format(new Date(ad.createdDate), 'PPP')}</TableCell>
            </TableRow>
            {ad.numDaysActive > 0 && (
              <TableRow>
                <TableCell className="font-semibold">Days active</TableCell>
                <TableCell>{ad.numDaysActive}</TableCell>
              </TableRow>
            )}
            {detailedTableStats && (
              <>
                <TableRow>
                  <TableCell className="font-semibold">Clicks</TableCell>
                  <TableCell>
                    {ad.clicksPerDayActive} per day ・ {ad.clicks} total ・{' '}
                    {ad.clickRateSrv}% click rate
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Active days</TableCell>
                  <TableCell>
                    {ad.currentDaysActive} currently ・ {ad.numDaysActive} total
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">User</TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/users/${ad.user.id}`}
                      newTab
                      showRightArrow
                      text={ad.user.username}
                    />
                  </TableCell>
                </TableRow>
              </>
            )}
          </TableBody>
        </Table>

        {ad.isAnimated ? <>animated not supported yet</> : displayedAd}
      </div>

      {shouldShowPayments && (
        <div className="mt-6">
          <h3>Payments</h3>
          {adData.payments.length > 0 ? (
            adData.payments.map(payment => (
              <p key={payment.registeredDate}>{JSON.stringify(payment)}</p>
            ))
          ) : (
            <p>There are no registered payments for this ad.</p>
          )}
        </div>
      )}

      <div className="mt-6">
        <h3>Engagement</h3>
        {adData.clicks.length >= 2 ? (
          <AdClickStats clickStats={adData.clicks} />
        ) : (
          <p>
            Once your ad has been getting clicks for at least two days, you'll see daily
            engagement here.
          </p>
        )}
      </div>
    </>
  );
}
