import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { format } from 'date-fns';
import { getAdById } from '~/route-funcs/get-ads';
import AdStatus from '~/ui-components/AdStatus/AdStatus';
import Breadcrumbs from '~/ui-components/Breadcrumbs/Breadcrumbs';
import Button from '~/ui-components/Buttons/Button';
import Link from '~/ui-components/Link';
import { Table, TableBody, TableCell, TableRow } from '~/ui-components/Table';
import { redirectIfNotLoggedIn } from '~/utils/loaders';
import { processApiError } from '~/utils/request-helpers';
import AdComicCard from '../browse/AdComicCard';
import { ADVERTISEMENTS } from '~/types/constants';
import { useMemo, useState } from 'react';
import type { Advertisement } from '~/types/types';
import Step2Details from '../advertising_.apply/step2-details';
import TopGradientBox from '~/ui-components/TopGradientBox';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import type { EditAdFormData } from '../api.edit-ad';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import { capitalizeString } from '~/utils/general';

export async function loader(args: LoaderFunctionArgs) {
  const user = await redirectIfNotLoggedIn(args);

  const adRes = await getAdById(args.context.DB, args.params.adId!);

  const returnObj = { adId: args.params.adId, ADS_PATH: args.context.ADS_PATH };

  if (adRes.err) {
    return processApiError('Error getting ad for advertising>ad', adRes.err, {
      user,
      adId: args.params.adId,
    });
  }

  if (adRes.notFound) {
    return { ...returnObj, adData: null, notFound: true };
  }

  return {
    ...returnObj,
    notFound: false,
    adData: adRes.result,
  };
}

export default function AdvertisingAd() {
  const { adData, notFound, adId, ADS_PATH } = useLoaderData<typeof loader>();
  const [isEditingAd, setIsEditingAd] = useState(false);
  const ad = adData?.ad;

  function editAd() {
    setIsEditingAd(true);
  }

  function setUpPayment() {
    return null;
  }

  function reactivateAd() {
    return null;
  }

  const displayedAd = useMemo(() => {
    if (!ad) return null;

    if (ad.adType === 'card') {
      // @ts-ignore
      return <AdComicCard ad={ad} adsPath={ADS_PATH} />;
    }
    const width = ad.adType === 'banner' ? 364 : 300;
    const height = ad.adType === 'banner' ? 45 : 90;
    return (
      <img
        src={`${ADS_PATH}/${ad.id}-2x.jpg`}
        style={{ maxWidth: width, maxHeight: height, width: 'auto', height: 'auto' }}
        width={width}
        height={height}
        alt="Ad"
      />
    );
  }, [ad, ADS_PATH]);

  const shouldShowPayments = ad && (adData.payments.length > 0 || ad.status === 'ACTIVE');

  return (
    <div className="container mx-auto pb-8">
      <h1>Manage ad</h1>

      <Breadcrumbs
        prevRoutes={[
          { text: 'Me', href: '/me' },
          { text: 'Advertising', href: '/advertising' },
          { text: 'Dashboard', href: '/advertising/dashboard' },
        ]}
        currentRoute={adData?.ad?.adName ?? adId ?? 'Ad'}
      />

      {notFound || !ad ? (
        <p>There is no ad with this ID.</p>
      ) : (
        <>
          {!isEditingAd && (
            <AdTopInfo
              ad={ad}
              editAd={editAd}
              setUpPayment={setUpPayment}
              reactivateAd={reactivateAd}
            />
          )}

          {isEditingAd ? (
            <AdEditing
              ad={ad}
              onCancel={() => setIsEditingAd(false)}
              onFinish={() => setIsEditingAd(false)}
            />
          ) : (
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
                  </TableBody>
                </Table>

                {ad.isAnimated ? <>animated not supported yet</> : displayedAd}
              </div>
            </>
          )}

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
            {adData.ad.clicks > 0 ? (
              <p>todo clicks</p>
            ) : (
              <p>
                Once your ad starts getting clicks, you can see daily engagement here.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function AdEditing({
  ad,
  onCancel,
  onFinish,
}: {
  ad: Advertisement;
  onCancel: () => void;
  onFinish: () => void;
}) {
  const [newAd, setNewAd] = useState({ ...ad });
  const [error, setError] = useState<string | null>(null);
  const fullAdType = ADVERTISEMENTS.find(a => a.name === newAd.adType);

  const submitFetcher = useGoodFetcher({
    url: '/api/edit-ad',
    method: 'post',
    toastSuccessMessage: 'Ad updated',
    toastError: false,
    onFinish,
    onError: setError,
  });

  function onSubmitChanges() {
    setError(null);

    const body: EditAdFormData = {
      adName: newAd.adName,
      adType: newAd.adType,
      id: newAd.id,
      link: newAd.link,
      notesComments: newAd.advertiserNotes,
      mainText: newAd.mainText ?? null,
      secondaryText: newAd.secondaryText ?? null,
    };

    submitFetcher.submit({ body: JSON.stringify(body) });
  }

  return (
    <TopGradientBox containerClassName="mt-6" innerClassName="p-6 pt-4 flex flex-col">
      <h3 className="-mb-2">Edit ad</h3>

      <Step2Details
        isNewAd={false}
        adName={newAd.adName}
        setAdName={val => setNewAd(newAd => ({ ...newAd, adName: val }))}
        adType={fullAdType}
        link={newAd.link}
        setLink={val => setNewAd(newAd => ({ ...newAd, link: val }))}
        mainText={newAd.mainText}
        setMainText={val => setNewAd(newAd => ({ ...newAd, mainText: val }))}
        secondaryText={newAd.secondaryText}
        setSecondaryText={val => setNewAd(newAd => ({ ...newAd, secondaryText: val }))}
        notesComments={newAd.advertiserNotes}
        setNotesComments={val => setNewAd(newAd => ({ ...newAd, advertiserNotes: val }))}
        isSubmitting={submitFetcher.isLoading}
        onBack={onCancel}
        onSubmit={onSubmitChanges}
        submitError={error}
        setCroppedFile={() => null}
        setSelectedFile={() => null}
      />
    </TopGradientBox>
  );
}

function AdTopInfo({
  ad,
  editAd,
  setUpPayment,
  reactivateAd,
}: {
  ad: Advertisement;
  editAd: () => void;
  setUpPayment: () => void;
  reactivateAd: () => void;
}) {
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const deactivateAdFetcher = useGoodFetcher({
    url: '/api/deactivate-ad',
    method: 'post',
    toastSuccessMessage: 'Ad deactivated',
    onFinish: () => setIsDeactivating(false),
  });

  const deleteAdFetcher = useGoodFetcher({
    url: '/api/delete-ad',
    method: 'post',
    toastSuccessMessage: 'Ad deleted',
    onFinish: () => {
      console.log('YO I FINISHED?!??!?!?!??!?!');
    },
  });

  if (isDeactivating) {
    return (
      <div className="bg-red-moreTrans p-4 w-fit flex flex-col gap-2">
        <h3>Deactivate ad?</h3>
        <p>
          Are you sure you want to deactivate this ad? It will immediately stop being
          shown to users, but you will not be refunded any paid amount. You can reactivate
          the ad later, but you'll have to pay for it again.
        </p>
        <div className="flex flex-row gap-4 mt-1">
          <Button onClick={() => setIsDeactivating(false)} text="No - keep ad" />
          <LoadingButton
            onClick={() => deactivateAdFetcher.submit({ id: ad.id })}
            text="Yes - deactivate ad"
            color="error"
            isLoading={deactivateAdFetcher.isLoading}
          />
        </div>
      </div>
    );
  }

  if (isDeleting) {
    return (
      <div className="bg-red-moreTrans p-4 w-fit flex flex-col gap-2">
        <h3>Delete ad?</h3>
        <p>Are you sure you want to delete this ad?</p>
        <div className="flex flex-row gap-4 mt-1">
          <Button onClick={() => setIsDeleting(false)} text="No - keep ad" />
          <LoadingButton
            onClick={() => {
              deleteAdFetcher.submit({ id: ad.id });
              navigate('/advertising/dashboard');
            }}
            text="Yes - delete ad"
            color="error"
            isLoading={deleteAdFetcher.isLoading}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-theme1-primaryTrans p-4 w-fit flex flex-col gap-2">
      <p>
        <b>Status</b>: <AdStatus status={ad.status} />
      </p>

      {ad.status === 'PENDING' && (
        <>
          <p>
            This ad is awaiting admin approval. Once it's approved, you will be able to
            pay to activate it. You will receive an email notification when this status
            change occurs.
          </p>

          <Button onClick={() => setIsDeleting(true)} text="Delete ad" color="error" />
        </>
      )}

      {ad.status === 'NEEDS CORRECTION' && (
        <>
          <p>
            This ad needs corrections. Please make the necessary edits. Once you have made
            the corrections, an admin will review your ad again.
          </p>
          <p>
            Admin change request: <b>{ad.correctionNote}</b>
          </p>

          <Button onClick={editAd} text="Edit ad" />
        </>
      )}

      {ad.status === 'AWAITING PAYMENT' && (
        <>
          <p>
            This ad has been approved. Once you set up recurring payments, it will
            immediately be activated.
          </p>

          <Button onClick={setUpPayment} text="Set up payments" />
        </>
      )}

      {ad.status === 'ACTIVE' && (
        <>
          <p>This ad is live, and is being shown to users on the site!</p>
          <p>
            You can make changes to your ad at any time without pausing it. If you do, we
            will review your edits to make sure everything looks good, and we reserve the
            right to pause your ad if it no longer meets our requirements or standards.
          </p>

          <div className="flex flex-row gap-4">
            <Button onClick={editAd} text="Edit ad" className="mt-1" />
            <Button
              onClick={() => setIsDeactivating(true)}
              text="Deactivate ad"
              className="mt-1"
              color="error"
            />
          </div>
        </>
      )}

      {ad.status === 'ENDED' && (
        <>
          <p>This ad has ended. You can reactivate it at any time.</p>

          <Button onClick={reactivateAd} text="Reactivate ad" />
        </>
      )}
    </div>
  );
}
