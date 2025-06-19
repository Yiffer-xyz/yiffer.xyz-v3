import { useEffect, useState } from 'react';

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

  useEffect(() => {
    fetch('/api/get-notifications')
      .then(res => res.json())
      .then(data => setNotifications(data as Notification[]))
      .finally(() => setLoading(false));
  }, []);

  const markAsRead = async (id: number) => {
    await fetch('/api/mark-notification-read', {
      method: 'POST',
      body: (() => { const fd = new FormData(); fd.append('notificationId', id.toString()); return fd; })(),
    });
    setNotifications(notifications.filter(n => n.id !== id));
  };

  if (loading) return <div>Loading notifications...</div>;
  if (notifications.length === 0) return <div>No new notifications.</div>;

  return (
    <div>
      <h2 className="text-lg font-bold mb-2">Notifications</h2>
      <ul>
        {notifications.map(n => {
          let data: NotificationData = {};
          try { data = n.data ? JSON.parse(n.data) : {}; } catch {}
          return (
            <li key={n.id} className="mb-2 flex items-center justify-between">
              <span>
                {n.type === 'new_page' ? (
                  <>New pages added to comic ID {n.comicId}{typeof data.numberOfPages === 'number' ? ` (now ${data.numberOfPages} pages)` : ''}</>
                ) : (
                  <>Notification: {n.type}</>
                )}
              </span>
              <button className="ml-4 text-xs text-blue-600 underline" onClick={() => markAsRead(n.id)}>
                Mark as read
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
} 