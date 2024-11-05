import { redirect, unstable_defineLoader } from '@remix-run/cloudflare';
import { Outlet, useLoaderData } from '@remix-run/react';
import type { ArtistTiny, ComicTiny, Tag } from '~/types/types';
import { redirectIfNotMod } from '~/utils/loaders';
import useWindowSize from '~/utils/useWindowSize';
import { getAllArtistsQuery, mapArtistTiny } from '~/route-funcs/get-artists';
import type { DbComicTiny } from '~/route-funcs/get-comics';
import { getAllComicNamesAndIDsQuery, mapDBComicTiny } from '~/route-funcs/get-comics';
import { getAllTagsQuery } from '~/route-funcs/get-tags';
import { makeDbErr, processApiError } from '~/utils/request-helpers';
import type { QueryWithParams } from '~/utils/database-facade';
import { queryDbMultiple } from '~/utils/database-facade';
import AdminSidebar, {
  mobileClosedBarW as mobileClosedSidebarW,
  sidebarWidth,
} from './AdminSidebar';
export { AdminErrorBoundary as ErrorBoundary } from '~/utils/error';

export type GlobalAdminContext = {
  comics: ComicTiny[];
  artists: ArtistTiny[];
  tags: Tag[];
};

export default function Admin() {
  const { isLgUp, width } = useWindowSize();
  const globalContext = useLoaderData<typeof loader>();

  return (
    <div className="pt-16">
      <AdminSidebar alwaysShow={isLgUp} delay={!width} />

      <div
        className="pb-4 px-6 lg:px-8"
        style={{ marginLeft: isLgUp ? sidebarWidth : mobileClosedSidebarW }}
      >
        <Outlet context={globalContext} />
      </div>
    </div>
  );
}

export const loader = unstable_defineLoader(async args => {
  await redirectIfNotMod(args);

  const url = new URL(args.request.url);
  if (url.pathname === '/admin' || url.pathname === '/admin/') {
    return redirect('/admin/dashboard');
  }

  const dbStatements: QueryWithParams[] = [
    getAllArtistsQuery({
      includePending: true,
      includeBanned: true,
      modifyNameIncludeType: true,
    }),
    getAllComicNamesAndIDsQuery({
      modifyNameIncludeType: true,
      includeUnlisted: true,
      includeThumbnailStatus: true,
    }),
    getAllTagsQuery(),
  ];

  const dbRes = await queryDbMultiple<[ArtistTiny[], DbComicTiny[], Tag[]]>(
    args.context.cloudflare.env.DB,
    dbStatements
  );

  if (dbRes.isError) {
    return processApiError(
      'Error in admin top level getter',
      makeDbErr(dbRes, 'Error getting artist+dbComic+tags')
    );
  }

  const [allDbArtists, allDbComics, tags] = dbRes.result;
  const artists = mapArtistTiny(allDbArtists, true);
  const comics = mapDBComicTiny(allDbComics, true);

  const globalContext: GlobalAdminContext = {
    comics,
    artists,
    tags,
  };

  return globalContext;
});
