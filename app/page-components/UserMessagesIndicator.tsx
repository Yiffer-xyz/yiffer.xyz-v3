import { Link as RouterLink, useLocation } from 'react-router';
import { FaEnvelope, FaRegEnvelope } from 'react-icons/fa';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import { useEffect } from 'react';

export default function UserMessagesIndicator() {
  const location = useLocation();
  const messagesFetcher = useGoodFetcher<{ hasUnreads: boolean }>({
    url: `/api/get-message-notifications`,
    method: 'GET',
    fetchGetOnLoad: true,
  });

  // Refetch on every navigation - will automatically clear notif when visiting /me/messages,
  // since that route loader clears the notification.
  useEffect(() => {
    messagesFetcher.submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search]);

  // Refetch every minute too - disabling to see if errors go away
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     messagesFetcher.submit();
  //   }, 60_000);
  //   return () => clearInterval(interval);
  // }, [messagesFetcher]);

  const hasUnreads = messagesFetcher.data?.hasUnreads ?? false;

  const containerClassName = hasUnreads ? 'bg-red-strong-300 dark:bg-red-strong-200' : '';
  const iconClassName = hasUnreads
    ? 'text-white'
    : 'text-gray-200 dark:text-blue-strong-300';

  return (
    <RouterLink to="/me/messages" className="px-2 ">
      <div
        className={`relative dark:bg-bg-dark text-text-light dark:text-text-dark 
          -mx-2.5 w-[22px] mt-1 pt-0.5 h-[22px] flex items-center justify-center rounded-full ${containerClassName}`}
      >
        {hasUnreads ? (
          <FaEnvelope size={14} color="white" className={iconClassName} />
        ) : (
          <FaRegEnvelope size={14} className={iconClassName} />
        )}
      </div>
    </RouterLink>
  );
}
