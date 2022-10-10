import { LoaderFunction, redirect } from '@remix-run/cloudflare';
import { Link, Outlet, useMatches } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { MdChevronRight } from 'react-icons/md';
import useWindowSize from '~/utils/useWindowSize';

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  if (url.pathname === '/admin' || url.pathname === '/admin/') {
    return redirect('/admin/dashboard');
  }
  return null;
};

const navWidth = 200;
const mobileClosedBarW = 24;
const mobileClosedBarTailwindUnits = mobileClosedBarW / 4;

export default function Admin({}) {
  const { isLgUp, width } = useWindowSize();
  return (
    <>
      <Sidebar alwaysShow={isLgUp} delay={!width} />
      <div
        className="pb-4 px-6 lg:px-8"
        style={{ marginLeft: isLgUp ? navWidth : mobileClosedBarW }}
      >
        <Outlet />
      </div>
    </>
  );
}

function Sidebar({ alwaysShow, delay }: { alwaysShow: boolean; delay: boolean }) {
  const matches = useMatches();
  const [isOpen, setIsOpen] = useState(alwaysShow);

  function isRoute(matchString: string) {
    return matches.some(m => m.pathname.includes(`/admin/${matchString}`));
  }

  // Close on navigation - aka a link selected
  useEffect(() => {
    setIsOpen(alwaysShow);
  }, [matches]);

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
          <p className="pt-6 pr-4 pb-4 pl-4 italic">Yiffer.xyz admin hub, sidebar style wip</p>
          <SidebarLink
            href="/admin/dashboard"
            text="Action dashboard"
            isSelected={isRoute('dashboard')}
          />
          <SidebarLink href="/admin/comics" text="Comic manager" isSelected={isRoute('comics')} />

          <p className="py-2 px-4 cursor-default">Artists</p>
          <SidebarLink
            isIndented
            href="/admin/artists/manage"
            text="Manage artist"
            isSelected={isRoute('artists/manage')}
          />
          <SidebarLink
            isIndented
            href="/admin/artists/new"
            text="New artist"
            isSelected={isRoute('artists/new')}
          />

          <p className="py-2 px-4 cursor-default">Tags</p>
          <SidebarLink
            isIndented
            href="/admin/tags/manage"
            text="Manage tag"
            isSelected={isRoute('tags/manage')}
          />
          <SidebarLink
            isIndented
            href="/admin/tags/new"
            text="New tag"
            isSelected={isRoute('tags/new')}
          />

          <SidebarLink
            href="/admin/pending-comics"
            text="Pending comics"
            isSelected={isRoute('pending-comics')}
          />
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
function SidebarLink({ href, text, isSelected = false, isIndented = false }: SidebarLinkProps) {
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
      className={`bg-theme1-primary dark:bg-gray-150 h-full w-${mobileClosedBarTailwindUnits + 2} 
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
