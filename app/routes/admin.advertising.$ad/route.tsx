import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { createSuccessJson, processApiError } from '~/utils/request-helpers';
import { getAdById } from '~/route-funcs/get-ads';
import Link from '~/ui-components/Link';
import { MdArrowBack, MdCheck } from 'react-icons/md';
import FullAdDisplay from '~/page-components/FullAdDisplay/FullAdDisplay';
import useWindowSize from '~/utils/useWindowSize';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import { approveActiveAd } from '~/route-funcs/approve-active-ad';
import { useGoodFetcher } from '~/utils/useGoodFetcher';

export default function ManageAd() {
  const isMobile = useWindowSize();
  const { adData, adsPath } = useLoaderData<typeof loader>();

  const approveAdFetcher = useGoodFetcher({
    method: 'post',
    toastSuccessMessage: 'Ad approved',
  });

  function onApproveAd() {
    const formData = new FormData();
    approveAdFetcher.submit(formData);
  }

  return (
    <>
      <h1>Ad: {adData.ad.id}</h1>
      <Link href="/admin/advertising" text="Back" Icon={MdArrowBack} />

      {adData.ad.isChangedWhileActive && (
        <div
          className={`py-2 px-4 bg-theme1-primaryTrans flex flex-col gap-1 mt-2 ${
            isMobile ? '' : 'w-fit'
          }`}
        >
          <h3>Changed while active</h3>
          <p>
            This ad's image, link, or display texts changed while the ad was active.
            Review and approve.
          </p>
          <LoadingButton
            text="Approve ad"
            startIcon={MdCheck}
            isLoading={approveAdFetcher.isLoading}
            onClick={onApproveAd}
            className="mt-1 mb-1"
          />
        </div>
      )}

      <FullAdDisplay adData={adData} adsPath={adsPath} showAdminFeatures />
    </>
  );
}

export async function loader(args: LoaderFunctionArgs) {
  const adId = args.params.ad as string;
  const adRes = await getAdById({
    adId,
    db: args.context.DB,
    includeDetailedStats: true,
  });

  if (adRes.err) {
    return processApiError('Error getting ad for admin>advertising>ad', adRes.err);
  }
  if (adRes.notFound) {
    throw new Response('Ad not found', { status: 404 });
  }

  return { adData: adRes.result, adsPath: args.context.ADS_PATH };
}

export async function action(args: ActionFunctionArgs) {
  const adId = args.params.ad as string;

  const res = await approveActiveAd(args.context.DB, adId);

  if (res?.error) {
    return processApiError('Error approving active ad', res);
  }

  return createSuccessJson();
}
