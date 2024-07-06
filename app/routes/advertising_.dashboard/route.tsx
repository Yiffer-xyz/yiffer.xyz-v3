import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import Breadcrumbs from '~/ui-components/Breadcrumbs/Breadcrumbs';
import Link from '~/ui-components/Link';
import AdStatus from '~/ui-components/AdStatus/AdStatus';
import {
  Table,
  TableBody,
  TableCell,
  TableHeadRow,
  TableRow,
} from '~/ui-components/Table';
import { redirectIfNotLoggedIn } from '~/utils/loaders';
import { getAds } from '~/route-funcs/get-ads';
import { processApiError } from '~/utils/request-helpers';

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
  };
}

export default function Advertising() {
  const { ads } = useLoaderData<typeof loader>();

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
        <>
          <Table horizontalScroll>
            <TableHeadRow>
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Clicks</TableCell>
            </TableHeadRow>
            <TableBody>
              {ads.map(ad => (
                <TableRow key={ad.id}>
                  <TableCell>
                    <Link
                      href={`/advertising/dashboard/${ad.id}`}
                      text={ad.adName}
                      showRightArrow
                      className="whitespace-pre-wrap break-word"
                    />
                  </TableCell>
                  <TableCell>
                    <AdStatus status={ad.status} />
                  </TableCell>
                  <TableCell>{ad.clicks}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      ) : (
        <p>No ads found</p>
      )}
    </div>
  );
}
