import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import Breadcrumbs from '~/ui-components/Breadcrumbs/Breadcrumbs';
import { redirectIfNotLoggedIn } from '~/utils/loaders';
import { getAds } from '~/route-funcs/get-ads';
import { processApiError } from '~/utils/request-helpers';
import AdListCard from '../../ui-components/Advertising/AdListCard';

export async function loader(args: LoaderFunctionArgs) {
  const user = await redirectIfNotLoggedIn(args);

  const ads = await getAds({
    db: args.context.DB,
    userId: user.userId,
  });

  if (ads.err) {
    return processApiError(
      'Error getting ads for advertising dashboard in loader',
      ads.err,
      { user }
    );
  }

  return {
    ads: ads.result,
    adsPath: args.context.ADS_PATH,
  };
}

export default function Advertising() {
  const { ads, adsPath } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto">
      <h1>Advertising dashboard</h1>

      <Breadcrumbs
        prevRoutes={[
          { text: 'Me', href: '/me' },
          { text: 'Advertising', href: '/advertising' },
        ]}
        currentRoute="Dashboard"
      />

      {ads.length > 0 ? (
        <div className="flex flex-col gap-2 w-fit max-w-full mt-2">
          {ads.map(ad => (
            <AdListCard
              ad={ad}
              adMediaPath={adsPath}
              frontendAdsPath="/advertising/dashboard"
              key={ad.id}
            />
          ))}
        </div>
      ) : (
        <p>No ads found</p>
      )}
    </div>
  );
}
