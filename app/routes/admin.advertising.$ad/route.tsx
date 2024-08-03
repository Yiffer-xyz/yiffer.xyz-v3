import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { processApiError } from '~/utils/request-helpers';
import { getAdById } from '~/route-funcs/get-ads';
import Link from '~/ui-components/Link';
import { MdArrowBack } from 'react-icons/md';
import FullAdDisplay from '~/page-components/FullAdDisplay/FullAdDisplay';

export default function ManageAd() {
  const { adData, adsPath } = useLoaderData<typeof loader>();

  return (
    <>
      <h1>Ad: {adData.ad.id}</h1>
      <Link href="/admin/advertising" text="Back" Icon={MdArrowBack} />

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
