import { addDays, addMonths, format, isSameDay } from 'date-fns';
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
import { MdCheck, MdClose, MdDelete, MdReplay } from 'react-icons/md';
import { useNavigate } from '@remix-run/react';
import IconButton from '~/ui-components/Buttons/IconButton';
import { FullAdPayments } from './FullAdPayments';
import InfoBox from '~/ui-components/InfoBox';

type Props = {
  adData: AdvertisementFullData;
  adsPath: string;
  showAdminFeatures?: boolean;
  imagesServerUrl?: string;
};

export default function FullAdDisplay({
  adData,
  adsPath,
  showAdminFeatures,
  imagesServerUrl,
}: Props) {
  const navigate = useNavigate();
  const ad = adData?.ad;
  const [updatedAd, setUpdatedAd] = useState<Advertisement>({ ...ad });

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isChanged = useMemo(() => {
    const isExpiryDateChanged =
      (!!updatedAd.expiryDate && !ad.expiryDate) ||
      (!updatedAd.expiryDate && !!ad.expiryDate) ||
      (updatedAd.expiryDate &&
        ad.expiryDate &&
        !isSameDay(updatedAd.expiryDate, ad.expiryDate));

    return (
      updatedAd.link !== ad.link ||
      updatedAd.status !== ad.status ||
      updatedAd.correctionNote !== ad.correctionNote ||
      isExpiryDateChanged
    );
  }, [updatedAd, ad]);

  const queryStr = `?q=${randomString(3)}`;

  const adTypeInfo = ADVERTISEMENTS.find(a => a.name === ad.adType);

  const displayedAd = useMemo(() => {
    if (!ad) return null;

    if (ad.adType === 'card') {
      return <AdComicCard ad={ad} adsPath={adsPath} className="h-fit" bypassCache />;
    }
    const width = ad.adType === 'banner' ? 364 : 300;
    const height = ad.adType === 'banner' ? 45 : 90;
    if (ad.mediaType === 'image') {
      return (
        <img
          src={`${adsPath}/${ad.id}-2x.jpg${queryStr}`}
          style={{ maxWidth: width, maxHeight: height, width: 'auto', height: 'auto' }}
          width={width}
          height={height}
          alt="Ad"
        />
      );
    } else if (ad.mediaType === 'gif') {
      return (
        <img
          src={`${adsPath}/${ad.id}-1x.gif${queryStr}`}
          style={{ maxWidth: width, maxHeight: height, width: 'auto', height: 'auto' }}
          width={width}
          height={height}
          alt="Ad"
        />
      );
    } else {
      return (
        <video
          style={{ maxWidth: width, maxHeight: height, width: 'auto', height: 'auto' }}
          width={width}
          height={height}
          autoPlay
          loop
          muted
        >
          <source src={`${adsPath}/${ad.id}-1x.webm${queryStr}`} type="video/webm" />
          <source src={`${adsPath}/${ad.id}-1x.mp4${queryStr}`} type="video/mp4" />
        </video>
      );
    }
  }, [ad, adsPath, queryStr]);

  const updateAdFetcher = useGoodFetcher({
    url: '/api/edit-ad',
    method: 'post',
    toastError: true,
    toastSuccessMessage: 'Ad updated',
    onFinish: () => {
      setIsEditing(false);
      setIsDeleting(false);
    },
  });

  const deleteAdFetcher = useGoodFetcher({
    url: '/api/delete-ad',
    method: 'post',
    toastError: true,
    toastSuccessMessage: 'Ad deleted',
    onFinish: () => {
      navigate('/admin/advertising');
    },
  });

  const markVideoAsConvertedFetcher = useGoodFetcher({
    url: '/api/set-ad-video-converted',
    method: 'post',
    toastSuccessMessage: 'Video marked as converted',
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
      correctionNote:
        updatedAd.status === 'NEEDS CORRECTION' && updatedAd.correctionNote
          ? updatedAd.correctionNote
          : null,
      expiryDate: updatedAd.expiryDate ? updatedAd.expiryDate : null,
    };

    updateAdFetcher.submit({ body: JSON.stringify(body) });
  }

  async function onDeleteAd() {
    await fetch(`${imagesServerUrl}/delete-ad`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adId: ad.id }),
    });

    const formData = new FormData();
    formData.append('id', ad.id);
    deleteAdFetcher.submit(formData);

    navigate('/admin/advertising');
  }

  async function onMarkVideoAsConverted() {
    const formData = new FormData();
    formData.append('adId', ad.id);
    markVideoAsConvertedFetcher.submit(formData);
  }

  function addMonthsToExpiryDate(months: number) {
    let date = updatedAd.expiryDate ?? addDays(new Date(), 1);
    date = addMonths(date, months);
    setUpdatedAd({ ...updatedAd, expiryDate: date });
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
                  onClick={() => {
                    setIsEditing(false);
                    setIsDeleting(false);
                  }}
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

      {adData.ad.isFromOldSystem && (
        <InfoBox
          showIcon
          variant="info"
          text="This ad was imported from the previous version of the site in Jan 2025. Activity stats from before this are not available."
          className="mb-4"
          fitWidth
          disableElevation
          small
          boldText={false}
        />
      )}

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
                {adTypeInfo?.title}, {ad.mediaType}
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

                      {updatedAd.status === 'NEEDS CORRECTION' && (
                        <TextInput
                          value={updatedAd.correctionNote ?? ''}
                          name="correctionNote"
                          label="Correction note"
                          className="mt-4"
                          onChange={newText =>
                            setUpdatedAd({ ...updatedAd, correctionNote: newText })
                          }
                        />
                      )}
                    </>
                  ) : (
                    <>
                      <AdStatusText status={ad.status} />
                      {ad.status === 'NEEDS CORRECTION' && ad.correctionNote && (
                        <p>{ad.correctionNote}</p>
                      )}
                    </>
                  )}
                </TableCell>
              </TableRow>
            )}
            {ad.expiryDate && (
              <TableRow>
                <TableCell className="font-semibold">Expires</TableCell>
                <TableCell>{format(ad.expiryDate, 'PPP')}</TableCell>
              </TableRow>
            )}
            {isEditing && (
              <TableRow>
                <TableCell className="font-semibold">Expires</TableCell>
                <TableCell>
                  <p className="mb-1">
                    {updatedAd.expiryDate ? format(updatedAd.expiryDate, 'PPP') : '-'}
                  </p>
                  <div className="flex flex-row gap-2 flex-wrap">
                    <Button
                      text="+1M"
                      onClick={() => addMonthsToExpiryDate(1)}
                      variant="outlined"
                    />
                    <Button
                      text="+4M"
                      onClick={() => addMonthsToExpiryDate(4)}
                      variant="outlined"
                    />
                    <Button
                      text="+12M"
                      onClick={() => addMonthsToExpiryDate(12)}
                      variant="outlined"
                    />
                    <IconButton
                      icon={MdReplay}
                      onClick={() =>
                        setUpdatedAd({ ...updatedAd, expiryDate: ad.expiryDate })
                      }
                      variant="naked"
                    />
                    <IconButton
                      icon={MdClose}
                      onClick={() =>
                        setUpdatedAd({ ...updatedAd, expiryDate: undefined })
                      }
                      variant="naked"
                      className="-ml-2"
                    />
                  </div>
                </TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell className="font-semibold">Link</TableCell>
              <TableCell className="max-w-[400px]">
                {isEditing ? (
                  <TextInput
                    value={updatedAd.link}
                    name="link"
                    onChange={newText => setUpdatedAd({ ...updatedAd, link: newText })}
                    className="min-w-max md:min-w-[500px]"
                  />
                ) : (
                  <Link
                    href={ad.link}
                    text={ad.link}
                    newTab
                    style={{ lineBreak: 'anywhere' }}
                  />
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

        {displayedAd}
      </div>

      {/* ADMIN EDITING */}
      {isEditing && showAdminFeatures && (
        <div className="mt-6 flex flex-row gap-2">
          {ad.videoSpecificFileType && !isDeleting && (
            <LoadingButton
              text="Mark video as converted"
              onClick={onMarkVideoAsConverted}
              startIcon={MdCheck}
              isLoading={deleteAdFetcher.isLoading}
            />
          )}

          {isDeleting ? (
            <>
              <Button
                text="Cancel, keep ad"
                variant="outlined"
                onClick={() => setIsDeleting(false)}
                startIcon={MdClose}
              />
              <LoadingButton
                text="Delete ad"
                color="error"
                onClick={onDeleteAd}
                isLoading={deleteAdFetcher.isLoading}
              />
            </>
          ) : (
            <Button
              text="Delete ad"
              color="error"
              startIcon={MdDelete}
              onClick={() => setIsDeleting(true)}
            />
          )}
        </div>
      )}

      <FullAdPayments adData={adData} showAdminFeatures={!!showAdminFeatures} />

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
