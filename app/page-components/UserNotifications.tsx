import { Link as RouterLink, useNavigation } from 'react-router';
import { useEffect, useState, useRef } from 'react';
import { FaBell, FaRegBell } from 'react-icons/fa';
import { GoDotFill } from 'react-icons/go';
import { LiaCheckDoubleSolid } from 'react-icons/lia';
import { MdArrowBack, MdArrowForward, MdCheck } from 'react-icons/md';
import type { ComicUpdateNotification } from '~/types/types';
import IconButton from '~/ui-components/Buttons/IconButton';
import Link from '~/ui-components/Link';
import { getTimeAgo } from '~/utils/date-utils';
import { useGoodFetcher } from '~/utils/useGoodFetcher';

export default function UserNotifications({
  pagesPath,
  isLoggedIn,
}: {
  pagesPath: string;
  isLoggedIn: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [notifIdsOverrideRead, setNotifIdsOverrideRead] = useState<number[]>([]);
  const [hasSetAllRead, setHasSetAllRead] = useState(false);
  useNavigation();

  const bellRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const notificationsFetcher = useGoodFetcher<{
    notifications: ComicUpdateNotification[];
    hasNextPage: boolean;
  }>({
    url: `/api/get-notifications?page=${page}`,
    method: 'GET',
    fetchGetOnLoad: isLoggedIn,
  });

  const markAllReadFetcher = useGoodFetcher({
    url: '/api/mark-all-notifications-read',
    method: 'POST',
  });

  const markSingleNotifReadFetcher = useGoodFetcher({
    url: '/api/mark-single-notification-read',
    method: 'POST',
  });

  function onMarkNotifRead(notifId: number) {
    setNotifIdsOverrideRead(prev => [...prev, notifId]);
    markSingleNotifReadFetcher.submit({ id: notifId });
  }

  function onMarkAllRead() {
    setHasSetAllRead(true);
    markAllReadFetcher.submit({});
  }

  function onPageChange(newPage: number) {
    setPage(newPage);
    notificationsFetcher.submit();
  }

  const notifFetcherData = notificationsFetcher.data;
  const notifications = notifFetcherData?.notifications ?? [];
  const hasNextPage = notifFetcherData?.hasNextPage ?? false;

  const hasUnreads = notifications.some(n => {
    const isOverrideRead = notifIdsOverrideRead.includes(n.id) || hasSetAllRead;
    return !n.isRead && !isOverrideRead;
  });

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const isInPopup = !(
        popupRef.current && !popupRef.current.contains(e.target as Node)
      );
      const isBell = !(bellRef.current && !bellRef.current.contains(e.target as Node));
      if (!isInPopup && !isBell) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const bellClassName = hasUnreads ? 'bg-red-strong-300 dark:bg-red-strong-200' : '';

  return (
    <div className="relative dark:bg-bg-dark text-text-light dark:text-text-dark">
      <button
        className={`text-gray-200 dark:text-blue-strong-300 cursor-pointer  
          flex flex-row items-center justify-center p-1 mt-1 -mr-1 -ml-1
          rounded-full ${bellClassName}`}
        ref={bellRef}
        onClick={() => setOpen(!open)}
        aria-label="Show notifications"
      >
        {hasUnreads ? <FaBell size={14} color="white" /> : <FaRegBell size={14} />}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-80 max-w-xs bg-white dark:bg-gray-100 shadow 
            rounded-lg z-40 px-2 pt-3 pb-4"
          ref={popupRef}
        >
          <div className="flex flex-row justify-between items-center px-2 mb-1">
            <p className="font-bold mb-2">New page notifications</p>
            {!notificationsFetcher.isLoading && (
              <>
                <div className="flex flex-row mb-1">
                  {hasUnreads && (
                    <IconButton
                      icon={LiaCheckDoubleSolid}
                      variant="naked"
                      className="p-1 w-6! h-6!"
                      onClick={onMarkAllRead}
                      disabled={notificationsFetcher.isLoading}
                    />
                  )}
                  {page > 1 && (
                    <IconButton
                      icon={MdArrowBack}
                      variant="naked"
                      className="p-1 w-6! h-6!"
                      onClick={() => onPageChange(page - 1)}
                      disabled={notificationsFetcher.isLoading}
                    />
                  )}
                  {hasNextPage && (
                    <IconButton
                      icon={MdArrowForward}
                      variant="naked"
                      className="p-1 w-6! h-6!"
                      onClick={() => onPageChange(page + 1)}
                      disabled={notificationsFetcher.isLoading}
                    />
                  )}
                </div>
              </>
            )}
          </div>
          <div>
            {notifications.length === 0 ? (
              <>
                {!isLoggedIn && (
                  <p className="text-gray-500 dark:text-gray-700 text-sm px-2 mb-4 -mt-2">
                    Log in to enable subscribing to comics.
                  </p>
                )}

                <p className="text-gray-500 dark:text-gray-700 text-sm px-2 -mt-2">
                  When you subscribe to comics (<FaRegBell />
                  ), notifications of new pages will show up here.
                </p>
                <p className="text-gray-500 dark:text-gray-700 text-sm px-2 mt-2">
                  Initially, only $15+{' '}
                  <Link href="/patreon" text="patrons" isInsideParagraph /> with linked
                  accounts get this feature. It'll start working for everyone a few weeks
                  later. Until then, the <FaRegBell /> works just like the old comic
                  bookmark used to.
                </p>
              </>
            ) : (
              <div className="-mt-2 -mb-2">
                {notifications.map(notif => {
                  return (
                    <NotificationItem
                      key={notif.id}
                      notif={notif}
                      pagesPath={pagesPath}
                      isOverrideRead={
                        notifIdsOverrideRead.includes(notif.id) || hasSetAllRead
                      }
                      onMarkRead={() => onMarkNotifRead(notif.id)}
                      onClick={() => {
                        setOpen(false);
                        setNotifIdsOverrideRead(prev => [...prev, notif.id]);
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationItem({
  notif,
  pagesPath,
  isOverrideRead,
  onClick,
  onMarkRead,
}: {
  notif: ComicUpdateNotification;
  pagesPath: string;
  isOverrideRead: boolean;
  onClick: () => void;
  onMarkRead: () => void;
}) {
  const isRead = notif.isRead || isOverrideRead;

  let url = `/c/${notif.comicName}`;
  if (!isRead) {
    url += `?markNotifRead=true`;
  }

  return (
    <RouterLink
      to={url}
      key={notif.id}
      className={`
      p-2 flex flex-row rounded overflow-hidden justify-between pr-2
      group items-center hover:bg-blue-more-trans
    `}
      onClick={onClick}
    >
      <div className="flex flex-row">
        <img
          src={`${pagesPath}/comics/${notif.comicId}/thumbnail-2x.webp`}
          alt={notif.comicName}
          className={`h-11 mr-2`}
        />

        <div className="flex flex-col justify-center">
          <p className={`text-sm ${isRead ? '' : 'font-bold'}`}>
            {!isRead && (
              <GoDotFill className="text-theme1-dark dark:text-theme1-primary mr-0 -ml-0.5 mb-[3px]" />
            )}
            {notif.comicName}
          </p>
          <p
            className={`text-xs dark:text-gray-800 text-gray-500 ${isRead ? '' : 'font-bold'}`}
          >
            {getTimeAgo(notif.timestamp)}
          </p>
        </div>
      </div>

      <button
        className={`opacity-0 w-7 h-7 pb-1 group-hover:opacity-100 hidden sm:block rounded-full hover:bg-blue-trans ${isRead && 'sm:hidden'}`}
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          onMarkRead();
        }}
      >
        <MdCheck className="dark:text-blue-strong-300 text-blue-weak-200 text-sm" />
      </button>
    </RouterLink>
  );
}
