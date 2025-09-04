import { Link, useMatches } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { MdChevronRight } from 'react-icons/md';
import type { UserType } from '~/types/types';

export const sidebarWidth = 200;
export const mobileClosedBarW = 24;
const mobileClosedBarTailwindUnits = mobileClosedBarW / 4;

export default function AdminSidebar({
  alwaysShow,
  delay,
  userType,
  hasUnreadSystemChats,
}: {
  alwaysShow: boolean;
  delay: boolean;
  userType: UserType;
  hasUnreadSystemChats: boolean;
}) {
  const matches = useMatches();
  const [isOpen, setIsOpen] = useState(alwaysShow);
  const [lastRoute, setLastRoute] = useState('');

  const isAdmin = userType === 'admin';

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
          className={`fixed inset-0 bg-black/30 z-10 transition-opacity duration-150 ${
            isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`flex flex-row h-screen w-fit fixed -mt-[22px] lg:dark:-mt-[20px]
          shadow-lg dark:shadow-none bg-white dark:bg-gray-200 lg:dark:bg-bg-dark 
          transition-width duration-150 z-10
          border-r-0 lg:dark:border-r-3 dark:border-r-gray-400`}
        style={{
          width: sidebarWidth,
          marginLeft: isOpen || alwaysShow ? 0 : mobileClosedBarW - sidebarWidth,
        }}
      >
        {!alwaysShow && <MobileExpander isOpen={isOpen} setIsOpen={setIsOpen} />}

        <div className="flex flex-col w-full">
          <SidebarLink
            href="/admin/dashboard"
            text="Action dashboard"
            isSelected={isRoute('dashboard')}
            className="pt-1"
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
            href="/admin/users"
            text="User manager"
            isSelected={isRoute('users')}
          />
          {isAdmin && (
            <SidebarLink
              href="/admin/advertising"
              text="Ads"
              isSelected={isRoute('advertising')}
            />
          )}
          {isAdmin && (
            <SidebarLink
              href="/admin/feedback-support"
              text="Feedback/support"
              isSelected={isRoute('feedback-support')}
            />
          )}
          {isAdmin && (
            <SidebarLink
              href="/admin/mod-applications"
              text="Mod applications"
              isSelected={isRoute('mod-applications')}
            />
          )}
          {isAdmin && (
            <SidebarLink
              href="/admin/system-chats"
              text="System chats"
              isSelected={isRoute('system-chats')}
              needsAttention={hasUnreadSystemChats}
            />
          )}
          {isAdmin && (
            <SidebarLink href="/admin/stats" text="Stats" isSelected={isRoute('stats')} />
          )}
          {isAdmin && (
            <SidebarLink href="/admin/blogs" text="Blogs" isSelected={isRoute('blogs')} />
          )}
          <SidebarLink
            href="/admin/actions-and-points"
            text="Actions & points"
            isSelected={isRoute('actions-and-points')}
          />
          <SidebarLink
            href="/admin/instructions"
            text="Instructions"
            isSelected={isRoute('instructions')}
          />
          <SidebarLink href="/admin/more" text="More" isSelected={isRoute('more')} />
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
  needsAttention?: boolean;
  className?: string;
}

const selectedClassname = 'bg-theme1-dark dark:bg-blue-strong-200 text-white';
function SidebarLink({
  href,
  text,
  isSelected = false,
  isIndented = false,
  needsAttention = false,
  className = '',
}: SidebarLinkProps) {
  return (
    <div
      className={`${isSelected && selectedClassname} hover:bg-theme1-primary-trans dark:hover:bg-blue-trans ${className}`}
    >
      <Link to={href}>
        <div
          className={`
            font-bold py-2 px-4  transition-background duration-100
            ${isIndented ? 'pr-4 pl-10' : 'px-4'}
          `}
        >
          {text}
          {needsAttention && (
            <span className="text-red-500 ml-1 text-lg leading-4">•</span>
          )}
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
        -right-px top-0 cursor-pointer hover:bg-theme1-dark transition-opacity
        flex items-center justify-center absolute ${
          !isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      onClick={() => setIsOpen(true)}
    >
      <MdChevronRight className="ml-[6px]" style={{ height: 24, width: 24 }} />
    </div>
  );
}
