import type {FeedbackType} from '~/types/types'
import Button from '~/ui-components/Buttons/Button'
import {format, parseISO} from 'date-fns'

type UserDataOrIP = {
  username?: string;
  userId?: number;
  userEmail?: string;
  ip?: string;
};

type FeedbackItemProps = {
  id: number;
  archived: boolean;
  text: string;
  type: FeedbackType;
  user: UserDataOrIP;
  timestamp: string;
  onArchiveClick: (id: number) => void;
  onDeleteClick: (id: number) => void;
};


export default function FeedbackItem({
  id,
  archived,
  text,
  type,
  user,
  timestamp,
  onArchiveClick,
  onDeleteClick
}: FeedbackItemProps) {
  function getTypeColor(type: FeedbackType) {
    switch (type) {
      case 'bug':
        return '#C92C2C';
      case 'general':
        return '#42BE47';
      case 'support':
        return '#2C9DDD';

      default:
        return '#000000';
    }
  }

  function getTypeText(type: FeedbackType) {
    switch (type) {
      case 'bug':
        return 'Bug';
      case 'general':
        return 'General feedback';
      case 'support':
        return 'Support';

      default:
        return 'Unknown';
    }
  }

  const userLink = user.userId ? `/admin/users/${user.userId}` : undefined;

  return (
    <div className="bg-white dark:bg-gray-300 rounded-lg shadow-lg p-4 flex flex-row justify-between">
      <div className="flex-1 flex-col">
        <div className="text-white inline-block text-xs rounded-full px-3 py-0.5" style={{backgroundColor: getTypeColor(type)}}>
          {getTypeText(type)}
        </div>
        <div className="my-2">
          {text}
        </div>
        <div>
          by
          <a className="ml-1 text-blue-weak-200 dark:text-blue-strong-200" href={userLink}>
            {user.username || 'Unknown user'}
          </a>
        </div>
        <div>
          {formatTimestamp(timestamp)}
        </div>
      </div>
      {!archived && (
        <div className="flex flex-col">
          <Button
            text="Archive"
            onClick={() => onArchiveClick(id)}
            fullWidth
            className="mb-3"
          />
          <Button
            text="Delete"
            color="error"
            onClick={() => onDeleteClick(id)}
            fullWidth
          />
        </div>
      )}
    </div>
  );
}

function formatTimestamp(timestamp: string): string {
  const date = parseISO(timestamp);

  return format(date, 'MMM dd yyyy');
}
