import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { getAdById } from '~/route-funcs/get-ads';
import AdStatusText from '~/ui-components/AdStatus/AdStatusText';
import Breadcrumbs from '~/ui-components/Breadcrumbs/Breadcrumbs';
import Button from '~/ui-components/Buttons/Button';
import { redirectIfNotLoggedIn } from '~/utils/loaders';
import { processApiError } from '~/utils/request-helpers';
import { ADVERTISEMENTS } from '~/types/constants';
import { useState } from 'react';
import type { Advertisement } from '~/types/types';
import Step2Details from '../advertising_.apply/step2-details';
import TopGradientBox from '~/ui-components/TopGradientBox';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import type { EditAdFormData } from '../api.edit-ad';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import FullAdDisplay from '~/page-components/FullAdDisplay/FullAdDisplay';

export async function loader(args: LoaderFunctionArgs) {
  const user = await redirectIfNotLoggedIn(args);

  const adRes = await getAdById({
    adId: args.params.adId!,
    db: args.context.DB,
    includeDetailedStats: true,
  });

  const returnObj = { adId: args.params.adId, adsPath: args.context.ADS_PATH };

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
  const { adData, notFound, adId, adsPath } = useLoaderData<typeof loader>();
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

          {isEditingAd && (
            <AdEditing
              ad={ad}
              onCancel={() => setIsEditingAd(false)}
              onFinish={() => setIsEditingAd(false)}
            />
          )}

          <FullAdDisplay adData={adData} adsPath={adsPath} />
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
      navigate('/advertising/dashboard');
    },
  });

  async function confirmDeleteAd() {
    await deleteAdFetcher.awaitSubmit({ id: ad.id });
  }

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
            onClick={confirmDeleteAd}
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
        <b>Status</b>: <AdStatusText status={ad.status} />
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
