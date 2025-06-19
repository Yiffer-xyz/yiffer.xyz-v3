import { useEffect, useState, useRef } from 'react';
import { FaBell } from 'react-icons/fa';

type NotificationData = {
  numberOfPages?: number;
};

type Notification = {
  id: number;
  comicId: number;
  type: string;
  data?: string;
};

export default function UserNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fetch('/api/get-notifications')
      .then(res => res.json())
      .then(data => setNotifications(data as Notification[]))
      .finally(() => setLoading(false));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const markAsRead = async (id: number) => {
    await fetch('/api/mark-notification-read', {
      method: 'POST',
      body: (() => { const fd = new FormData(); fd.append('notificationId', id.toString()); return fd; })(),
    });
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const unreadCount = notifications.length;

  return (
    <div className="relative ml-2">
      <button
        ref={bellRef}
        className="relative p-2 rounded-full hover:bg-theme1-primaryTrans focus:bg-theme1-primaryTrans transition"
        onClick={() => setOpen(o => !o)}
        aria-label="Show notifications"
      >
        <FaBell className="text-theme1-dark dark:text-theme1-primary" size={22} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-strong-300 text-white text-xs rounded-full px-1.5 py-0.5 font-bold border-2 border-white dark:border-bgDark">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-xs bg-white dark:bg-bgDark shadow-lg rounded-lg z-40 border border-gray-200 dark:border-gray-700">
          <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <span className="font-bold text-theme1-dark dark:text-theme1-primary text-base">Notifications</span>
            <button className="text-xs text-gray-500 hover:text-theme1-dark dark:hover:text-theme1-primary" onClick={() => setOpen(false)}>Close</button>
          </div>
          <ul className="max-h-80 overflow-y-auto p-2">
            {loading ? (
              <li className="text-center py-4 text-gray-500">Loading...</li>
            ) : notifications.length === 0 ? (
              <li className="text-center py-4 text-gray-500">No new notifications.</li>
            ) : notifications.map(n => {
              let data: NotificationData = {};
              try { data = n.data ? JSON.parse(n.data) : {}; } catch {}
              return (
                <li key={n.id} className="mb-2 flex items-center justify-between bg-theme1-primaryTrans dark:bg-theme1-primaryMoreTrans rounded px-3 py-2">
                  <span className="text-sm text-theme1-dark dark:text-theme1-primary">
                    {n.type === 'new_page' ? (
                      <>📖 <b>New pages</b> added to comic <b>#{n.comicId}</b>{typeof data.numberOfPages === 'number' ? ` (now ${data.numberOfPages} pages)` : ''}</>
                    ) : (
                      <>Notification: {n.type}</>
                    )}
                  </span>
                  <button
                    className="ml-4 text-xs bg-blue-weak-200 hover:bg-blue-weak-100 dark:bg-blue-strong-200 dark:hover:bg-blue-strong-100 text-white rounded px-2 py-1 font-semibold transition"
                    onClick={() => markAsRead(n.id)}
                  >
                    Mark as read
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
} 