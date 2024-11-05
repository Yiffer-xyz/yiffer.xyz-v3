import { format } from 'date-fns';
import { useMemo, useState } from 'react';
import AdClickStats from '~/routes/advertising_.dashboard_.$adId/AdClickStats';
import type { EditAdFormData } from '~/routes/api.edit-ad';
import AdComicCard from '~/ui-components/Advertising/AdComicCard';
import { ADVERTISEMENTS } from '~/types/constants';
import { allAdStatuses } from '~/types/types';
import type { Advertisement, AdvertisementFullData } from '~/types/types';
import AdStatusText from '~/ui-components/Advertising/AdStatusText';
import Button from '~/ui-components/Buttons/Button';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import Link from '~/ui-components/Link';
import Select from '~/ui-components/Select/Select';
import { Table, TableBody, TableCell, TableRow } from '~/ui-components/Table';
import TextInput from '~/ui-components/TextInput/TextInput';
import { capitalizeString, randomString } from '~/utils/general';
import { useGoodFetcher } from '~/utils/useGoodFetcher';

type Props = {
  adData: AdvertisementFullData;
  adsPath: string;
  showAdminFeatures?: boolean;
};

export default function FullAdDisplay({ adData, adsPath, showAdminFeatures }: Props) {
  const ad = adData?.ad;
  const [updatedAd, setUpdatedAd] = useState<Advertisement>({ ...ad });
  const shouldShowPayments = ad && (adData.payments.length > 0 || ad.status === 'ACTIVE');

  const [isEditing, setIsEditing] = useState(false);

  const isChanged = useMemo(() => {
    return updatedAd.link !== ad.link || updatedAd.status !== ad.status;
  }, [updatedAd, ad]);

  const queryStr = `?q=${randomString(3)}`;

  const displayedAd = useMemo(() => {
    if (!ad) return null;

    if (ad.adType === 'card') {
      return <AdComicCard ad={ad} adsPath={adsPath} className="h-fit" bypassCache />;
    }
    const width = ad.adType === 'banner' ? 364 : 300;
    const height = ad.adType === 'banner' ? 45 : 90;
    return (
      <img
        src={`${adsPath}/${ad.id}-2x.jpg${queryStr}`}
        style={{ maxWidth: width, maxHeight: height, width: 'auto', height: 'auto' }}
        width={width}
        height={height}
        alt="Ad"
      />
    );
  }, [ad, adsPath, queryStr]);

  const updateAdFetcher = useGoodFetcher({
    url: '/api/edit-ad',
    method: 'post',
    toastError: true,
    toastSuccessMessage: 'Ad updated',
    onFinish: () => {
      setIsEditing(false);
    },
  });

  function onSaveChanges() {
    // Most of these fields aren't needed, but it's easier than changing the body type.
    const body: EditAdFormData = {
      adName: updatedAd.adName,
      adType: updatedAd.adType,
      id: updatedAd.id,
      link: updatedAd.link,
      mainText: updatedAd.mainText ?? null,
      secondaryText: updatedAd.secondaryText ?? null,
      notesComments: updatedAd.advertiserNotes ?? null,
      status: updatedAd.status !== ad.status ? updatedAd.status : null,
    };

    updateAdFetcher.submit({ body: JSON.stringify(body) });
  }

  return (
    <>
      <div className="flex flex-row items-center">
        <h3 className="mt-4 mb-1">Details</h3>
        {showAdminFeatures && (
          <div className="ml-4 mt-2.5 h-fit flex flex-row gap-2">
            {!isEditing ? (
              <Button
                text="Edit"
                variant="outlined"
                className="h-fit"
                onClick={() => setIsEditing(true)}
              />
            ) : (
              <>
                <Button
                  text="Cancel"
                  variant="outlined"
                  className="h-fit"
                  onClick={() => setIsEditing(false)}
                />
                <LoadingButton
                  text="Save"
                  className="h-fit"
                  onClick={onSaveChanges}
                  disabled={!isChanged}
                  isLoading={updateAdFetcher.isLoading}
                />
              </>
            )}
          </div>
        )}
      </div>

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
            {showAdminFeatures && (
              <TableRow>
                <TableCell className="font-semibold">Status</TableCell>
                <TableCell>
                  {isEditing ? (
                    <>
                      <Select
                        options={allAdStatuses.map(status => ({
                          value: status,
                          text: capitalizeString(status),
                        }))}
                        value={updatedAd.status}
                        name="status"
                        onChange={newStatus =>
                          setUpdatedAd({ ...updatedAd, status: newStatus })
                        }
                      />
                    </>
                  ) : (
                    <AdStatusText status={ad.status} />
                  )}
                </TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell className="font-semibold">Link</TableCell>
              <TableCell>
                {isEditing ? (
                  <TextInput
                    value={updatedAd.link}
                    name="link"
                    onChange={newText => setUpdatedAd({ ...updatedAd, link: newText })}
                  />
                ) : (
                  <Link href={ad.link} text={ad.link} newTab />
                )}
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
                <TableCell>{format(ad.expiryDate, 'PPP')}</TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell className="font-semibold">Created</TableCell>
              <TableCell>{format(ad.createdDate, 'PPP')}</TableCell>
            </TableRow>
            {ad.numDaysActive > 0 && (
              <TableRow>
                <TableCell className="font-semibold">Days active</TableCell>
                <TableCell>{ad.numDaysActive}</TableCell>
              </TableRow>
            )}
            {showAdminFeatures && (
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
              <p key={payment.registeredDate.getTime()}>{JSON.stringify(payment)}</p>
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
