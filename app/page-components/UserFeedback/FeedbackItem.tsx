import type { FeedbackType } from '~/types/types';
import { format } from 'date-fns';
import Chip from '~/ui-components/Chip';
import Link from '~/ui-components/Link';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import type { ArchiveFeedbackBody } from '~/routes/api.admin.archive-feedback';
import type { DeleteFeedbackBody } from '~/routes/api.admin.delete-feedback';
import type { Feedback } from '~/route-funcs/get-feedback';

export default function FeedbackItem({ feedback }: { feedback: Feedback }) {
  const { id, isArchived, text, type, user, timestamp } = feedback;

  const archiveFeedbackFetcher = useGoodFetcher({
    url: '/api/admin/archive-feedback',
    method: 'post',
  });
  const deleteFeedbackFetcher = useGoodFetcher({
    url: '/api/admin/delete-feedback',
    method: 'post',
  });

  function onArchiveClick(id: number) {
    const body: ArchiveFeedbackBody = { feedbackId: id };
    archiveFeedbackFetcher.submit({ body: JSON.stringify(body) });
  }

  function onDeleteClick(id: number) {
    const body: DeleteFeedbackBody = { feedbackId: id };
    deleteFeedbackFetcher.submit({ body: JSON.stringify(body) });
  }

  return (
    <div className="bg-white dark:bg-gray-300 rounded-lg shadow-md p-3 flex flex-row gap-1 justify-between">
      <div className="flex-1 flex-col">
        <Chip color={getTypeColor(type)} text={getTypeText(type)} />

        <div className="mt-1.5 mb-1">{text}</div>

        <p>
          by
          {user.userId && user.username ? (
            <Link
              className="ml-1 text-blue-weak-200 dark:text-blue-strong-200"
              href={`/admin/users/${user.userId}`}
              text={user.username}
              showRightArrow
            />
          ) : (
            ' ' + (user.ip ?? 'unknown user')
          )}
        </p>

        <div>{format(timestamp, 'PP')}</div>
      </div>

      {!isArchived && (
        <div className="flex flex-col">
          <LoadingButton
            text="Archive"
            onClick={() => onArchiveClick(id)}
            isLoading={archiveFeedbackFetcher.isLoading}
            disabled={deleteFeedbackFetcher.isLoading}
            fullWidth
            className="mb-2"
            disableElevation
          />
          <LoadingButton
            text="Delete"
            color="error"
            onClick={() => onDeleteClick(id)}
            isLoading={deleteFeedbackFetcher.isLoading}
            disabled={archiveFeedbackFetcher.isLoading}
            fullWidth
            disableElevation
          />
        </div>
      )}
    </div>
  );
}

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
