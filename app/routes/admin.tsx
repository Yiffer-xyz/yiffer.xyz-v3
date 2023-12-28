import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { redirect } from '@remix-run/cloudflare';
import { Link, Outlet, useLoaderData, useMatches } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { MdChevronRight } from 'react-icons/md';
import type { ArtistTiny, ComicTiny, Tag } from '~/types/types';
import { redirectIfNotMod } from '~/utils/loaders';
import useWindowSize from '~/utils/useWindowSize';
import { getAllArtists } from '~/route-funcs/get-artists';
import { getAllComicNamesAndIDs } from '~/route-funcs/get-comics';
import { getAllTags } from '~/route-funcs/get-tags';
import { processApiError } from '~/utils/request-helpers';

export type GlobalAdminContext = {
  comics: ComicTiny[];
  artists: ArtistTiny[];
  tags: Tag[];
};

export { ErrorBoundary } from '~/utils/error';

const navWidth = 200;
const mobileClosedBarW = 24;
const mobileClosedBarTailwindUnits = mobileClosedBarW / 4;

export default function Admin() {
  const { isLgUp, width } = useWindowSize();
  const globalContext = useLoaderData<typeof loader>();

  return (
    <>
      <Sidebar alwaysShow={isLgUp} delay={!width} />
      <div
        className="pb-4 px-6 lg:px-8"
        style={{ marginLeft: isLgUp ? navWidth : mobileClosedBarW }}
      >
        <Outlet context={globalContext} />
      </div>
    </>
  );
}

export async function loader(args: LoaderFunctionArgs) {
  const urlBase = args.context.DB_API_URL_BASE;
  await redirectIfNotMod(args);

  const url = new URL(args.request.url);
  if (url.pathname === '/admin' || url.pathname === '/admin/') {
    return redirect('/admin/dashboard');
  }

  const [comicsRes, artistsRes, tagsRes] = await Promise.all([
    getAllComicNamesAndIDs(urlBase, {
      modifyNameIncludeType: true,
      includeUnlisted: true,
      includeThumbnailStatus: true,
    }),
    getAllArtists(urlBase, {
      includePending: true,
      includeBanned: true,
      modifyNameIncludeType: true,
    }),
    getAllTags(urlBase),
  ]);

  if (comicsRes.err || !comicsRes.comics) {
    return processApiError(
      'Error getting comics in mod panel',
      comicsRes.err || { logMessage: 'Comics returned as null' }
    );
  }
  if (artistsRes.err || !artistsRes.artists) {
    return processApiError(
      'Error getting artists in mod panel',
      artistsRes.err || { logMessage: 'Artists returned as null' }
    );
  }
  if (tagsRes.err || !tagsRes.tags) {
    return processApiError(
      'Error getting tags in mod panel',
      tagsRes.err || { logMessage: 'Tags returned as null' }
    );
  }

  const globalContext: GlobalAdminContext = {
    comics: comicsRes.comics,
    artists: artistsRes.artists,
    tags: tagsRes.tags,
  };

  return globalContext;
}

function Sidebar({ alwaysShow, delay }: { alwaysShow: boolean; delay: boolean }) {
  const matches = useMatches();
  const [isOpen, setIsOpen] = useState(alwaysShow);
  const [lastRoute, setLastRoute] = useState('');

  function isRoute(matchString: string) {
    return matches.some(match => {
      return match.pathname.includes(`/admin/${matchString}`);
    });
  }

  useEffect(() => {
    setLastRoute(matches[matches.length - 1].pathname);
  }, [matches]);

  // Close on navigation - aka a link selected
  useEffect(() => {
    setIsOpen(alwaysShow);
  }, [lastRoute, alwaysShow]);

  // Prevent initially rendering wrong until the window size has been determined
  if (delay) {
    return <></>;
  }

  return (
    <>
      {/* backdrop, close when clicking outside, will only show when small screens & sidebar open */}
      {!delay && !alwaysShow && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-30 z-10 transition-opacity duration-150 ${
            isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`flex flex-row h-screen bg-white w-fit fixed -mt-4 shadow-lg lg:dark:shadow-2xl z-20
        dark:bg-gray-200 lg:dark:bg-gray-200 transition-width duration-150`}
        style={{
          width: navWidth,
          marginLeft: isOpen || alwaysShow ? 0 : mobileClosedBarW - navWidth,
        }}
      >
        {!alwaysShow && <MobileExpander isOpen={isOpen} setIsOpen={setIsOpen} />}

        <div className="flex flex-col w-full">
          <p className="pt-6 pr-4 pb-4 pl-4 italic">
            Yiffer.xyz admin hub, sidebar style wip
          </p>
          <SidebarLink
            href="/admin/dashboard"
            text="Action dashboard"
            isSelected={isRoute('dashboard')}
          />
          <SidebarLink
            href="/admin/pending-comics"
            text="Pending comics"
            isSelected={isRoute('pending-comics')}
          />
          <SidebarLink
            href="/admin/comics"
            text="Comic manager"
            isSelected={isRoute('comics')}
          />
          <SidebarLink
            href="/admin/artists"
            text="Artist manager"
            isSelected={isRoute('artists')}
          />
          <SidebarLink
            href="/admin/tags"
            text="Tag manager"
            isSelected={isRoute('tags')}
          />
          <SidebarLink
            href="/admin/feedback-support"
            text="Feedback/support"
            isSelected={isRoute('feedback-support')}
          />
          <SidebarLink
            href="/admin/thumbnails"
            text="Update thumbnails"
            isSelected={isRoute('thumbnails')}
          />
          <SidebarLink href="/admin/stats" text="Stats" isSelected={isRoute('stats')} />
        </div>
      </div>
    </>
  );
}

interface SidebarLinkProps {
  href: string;
  text: string;
  isSelected?: boolean;
  isIndented?: boolean;
}

const selectedClassname = 'bg-theme1-dark dark:bg-blue-strong-200 text-white';
function SidebarLink({
  href,
  text,
  isSelected = false,
  isIndented = false,
}: SidebarLinkProps) {
  const className = isSelected ? selectedClassname : '';
  return (
    <div className={className}>
      <Link to={href}>
        <div
          className={`
            font-bold py-2 px-4 hover:bg-theme1-primaryTrans dark:hover:bg-blue-trans transition-background duration-100
            ${isIndented ? 'pr-4 pl-10' : 'px-4'}
          `}
        >
          {text}
        </div>
      </Link>
    </div>
  );
}

function MobileExpander({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  return (
    <div
      className={`bg-theme1-primary dark:bg-gray-150 h-full w-${
        mobileClosedBarTailwindUnits + 2
      } 
            -right-[1px] top-0 hover:cursor-pointer hover:bg-theme1-dark transition-opacity
            flex items-center justify-center absolute ${
              !isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
      onClick={() => setIsOpen(true)}
    >
      <MdChevronRight className="ml-[6px]" style={{ height: 24, width: 24 }} />
    </div>
  );
}
