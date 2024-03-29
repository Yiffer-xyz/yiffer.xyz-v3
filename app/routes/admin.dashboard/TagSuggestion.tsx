import { MdOpenInNew } from 'react-icons/md';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import Chip from '~/ui-components/Chip';
import Link from '~/ui-components/Link';
import type { DashboardAction } from '../api.admin.dashboard-data';
import { useUIPreferences } from '~/utils/theme-provider';
import { getTimeAgo } from './route';

export type TagSuggestionAction = DashboardAction & {
  isAdding: boolean;
  tagId: number;
};

type TagSuggestionProps = {
  action: TagSuggestionAction;
  onProcessSuggestion: (action: TagSuggestionAction, isApproved: boolean) => void;
  isLoading: boolean;
  loadingAction?: string;
  innerContainerClassName: string;
};

export function TagSuggestion({
  action,
  onProcessSuggestion,
  isLoading,
  loadingAction,
  innerContainerClassName,
}: TagSuggestionProps) {
  const { theme } = useUIPreferences();
  const themedColor = theme === 'light' ? '#51bac8' : '#2299a9';

  return (
    <div className={innerContainerClassName}>
      <div className="flex flex-col justify-between gap-2">
        <Chip color={themedColor} text="Tag suggestion" />
        <div className="flex flex-col md:flex-row gap-x-12 gap-y-1">
          <div className="flex flex-row gap-x-3">
            <b>{action.primaryField}</b>
            <Link
              href={`/admin/comics/${action.comicId}`}
              text="Admin"
              IconRight={MdOpenInNew}
              newTab
            />
            <Link
              href={`/${action.primaryField}`}
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

        {action.isProcessed && (
          <p>
            <i>Completed by: {action.assignedMod?.username}</i>
          </p>
        )}
        {!action.isProcessed && (
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
        )}
      </div>
    </div>
  );
}
