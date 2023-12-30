import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { processApiError } from '~/utils/request-helpers';
import { getAdById } from '~/route-funcs/get-ads';
import Link from '~/ui-components/Link';
import { MdArrowBack } from 'react-icons/md';

export default function ManageAd() {
  const { ad, payments } = useLoaderData<typeof loader>();

  return (
    <>
      <h1>Ad: {ad.id}</h1>
      <Link href="/admin/advertising" text="Back" Icon={MdArrowBack} />
      <p className="font-bold my-4">ℹ️ See the figma prototype.</p>

      <pre>{JSON.stringify(ad, null, 2)}</pre>
      <p>Payments</p>
      <pre>{JSON.stringify(payments, null, 2)}</pre>
    </>
  );
}

export async function loader(args: LoaderFunctionArgs) {
  const urlBase = args.context.DB_API_URL_BASE;
  const adId = args.params.ad as string;
  const adRes = await getAdById(urlBase, adId);

  if (adRes.err) {
    return processApiError('Error getting ad for admin>advertising>ad', adRes.err);
  }
  if (adRes.notFound) {
    throw new Response('Ad not found', { status: 404 });
  }

  return adRes.result;
}
