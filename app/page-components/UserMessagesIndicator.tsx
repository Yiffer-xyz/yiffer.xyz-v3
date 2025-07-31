import { Link as RemixLink } from '@remix-run/react';
import { FaEnvelope, FaRegEnvelope } from 'react-icons/fa';
import { useGoodFetcher } from '~/utils/useGoodFetcher';

export default function UserMessagesIndicator() {
  const messagesFetcher = useGoodFetcher<{
    unreadCount: number;
  }>({
    url: `/api/get-messages`,
    method: 'get',
    fetchGetOnLoad: true,
  });

  const hasUnreads =
    messagesFetcher.data?.unreadCount && messagesFetcher.data.unreadCount > 0;

  const containerClassName = hasUnreads ? 'bg-red-strong-300 dark:bg-red-strong-200' : '';
  const iconClassName = hasUnreads
    ? 'text-white'
    : 'text-gray-200 dark:text-blue-strong-300';

  return (
    <RemixLink to="/me/messages" className="px-2 ">
      <div
        className={`relative dark:bg-bg-dark text-text-light dark:text-text-dark 
          -mx-2.5 w-[22px] mt-1 pt-1 h-[22px] flex items-center justify-center rounded-full ${containerClassName}`}
      >
        {hasUnreads ? (
          <FaEnvelope size={14} color="white" className={iconClassName} />
        ) : (
          <FaRegEnvelope size={14} className={iconClassName} />
        )}
      </div>
    </RemixLink>
  );
}
