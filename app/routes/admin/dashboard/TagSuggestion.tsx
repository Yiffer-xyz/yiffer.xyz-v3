import { MdOpenInNew } from 'react-icons/md';
import LoadingButton from '~/components/Buttons/LoadingButton';
import Chip from '~/components/Chip';
import Link from '~/components/Link';
import { DashboardAction } from '~/routes/api/admin/dashboard-data';
import { getTimeAgo } from '.';

type TagSuggestionProps = {
  action: TagSuggestionAction;
  onProcessSuggestion: (action: TagSuggestionAction, isApproved: boolean) => void;
  isLoading: boolean;
  loadingAction?: string;
};

export type TagSuggestionAction = DashboardAction & {
  isAdding: boolean;
  tagId: number;
};

export function TagSuggestion({
  action,
  onProcessSuggestion,
  isLoading,
  loadingAction,
}: TagSuggestionProps) {
  return (
    <>
      <div className="flex flex-col justify-between gap-2">
        <Chip color="#51bac8" text="Tag suggestion" />
        <div className="flex flex-col md:flex-row gap-x-12 gap-y-1">
          <div className="flex flex-row gap-x-3">
            <b>{action.primaryField}</b>
            <Link
              href={`/admin/comics/${action.comicId!}`}
              text="Admin"
              IconRight={MdOpenInNew}
              newTab
            />
            <Link
              href={`/comics/${action.primaryField}`}
              text="Live"
              IconRight={MdOpenInNew}
              newTab
            />
          </div>
          <p>{action.secondaryField}</p>
        </div>
      </div>
      <div className="flex flex-col md:items-end justify-between gap-2 flex-shrink-0">
        <p className="text-sm">
          {action.user.username || action.user.ip}
          {' - '}
          {getTimeAgo(action.timestamp)}
        </p>

        <div className="flex flex-row gap-2 self-end">
          <LoadingButton
            color="error"
            onClick={() => onProcessSuggestion(action, false)}
            text="Reject"
            isLoading={isLoading && loadingAction === 'reject-tag'}
          />
          <LoadingButton
            color="primary"
            onClick={() => onProcessSuggestion(action, true)}
            text="Approve"
            isLoading={isLoading && loadingAction === 'approve-tag'}
          />
        </div>
      </div>
    </>
  );
}
