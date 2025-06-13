import { useState } from 'react';
import { IoCaretDown, IoCaretUp } from 'react-icons/io5';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import Chip from '~/ui-components/Chip';
import Link from '~/ui-components/Link';
import type { DashboardAction } from '../api.admin.dashboard-data';
import { useUIPreferences } from '~/utils/theme-provider';
import { getTimeAgo } from '~/utils/date-utils';
import Username from '~/ui-components/Username';

type ComicUploadProps = {
  action: DashboardAction;
  isLoading: boolean;
  onAssignMe: (action: DashboardAction) => void;
  onUnassignMe: (action: DashboardAction) => void;
  loadingAction?: string;
  isAssignedToOther?: boolean;
  isAssignedToMe?: boolean;
  innerContainerClassName: string;
  blockActions?: boolean;
  pagesPath: string;
};

export function ComicUpload({
  action,
  isLoading,
  onAssignMe,
  onUnassignMe,
  loadingAction,
  isAssignedToOther,
  isAssignedToMe,
  innerContainerClassName,
  blockActions,
  pagesPath,
}: ComicUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useUIPreferences();
  const themedColor = theme === 'light' ? '#8c7ad5' : '#6751be';

  return (
    <div
      className={`flex flex-col w-full gap-2 ${
        action.isProcessed ? 'cursor-pointer' : ''
      }`}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className={innerContainerClassName}>
        <div className="flex flex-col justify-between gap-2">
          <Chip color={themedColor} text="Comic upload" />
          <div className="flex flex-col md:flex-row gap-x-12 gap-y-1">
            <div className="flex flex-row gap-x-3">
              <Link
                href={`/admin/comics/${action.comicId}`}
                text={action.primaryField}
                showRightArrow
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col md:items-end justify-between gap-2 flex-shrink-0">
          <div className="flex flex-row gap-x-1">
            {action.user.username && action.user.userId ? (
              <Username
                id={action.user.userId}
                username={action.user.username}
                pagesPath={pagesPath}
                textClassName="text-sm"
                className="mt-0 md:-mt-[3px]"
                showRightArrow={false}
              />
            ) : (
              <p className="text-sm">{action.user.ip}</p>
            )}
            <p className="text-sm">
              {' - '}
              {getTimeAgo(action.timestamp)}
            </p>
          </div>

          {action.isProcessed && (
            <p>
              <i>Completed by: {action.assignedMod?.username}</i>
            </p>
          )}
          {isAssignedToOther && (
            <p>
              <i>Assigned to: {action.assignedMod?.username}</i>
            </p>
          )}

          <div className="flex flex-row gap-2 self-end">
            {isAssignedToMe && (
              <LoadingButton
                color="error"
                onClick={() => onUnassignMe(action)}
                text="Unassign from me"
                isLoading={isLoading && loadingAction === 'unassign'}
                disabled={blockActions}
              />
            )}
            {!action.isProcessed && !action.assignedMod && (
              <LoadingButton
                color="primary"
                onClick={() => onAssignMe(action)}
                text="I'm on it"
                isLoading={isLoading && loadingAction === 'assign'}
                disabled={blockActions}
              />
            )}
          </div>
        </div>
      </div>

      {action.isProcessed && (
        <>
          {isOpen ? (
            <>
              {action.isProcessed && (
                <p>
                  <b>Verdict: {action.verdict}</b>
                </p>
              )}

              <IoCaretUp className="mx-auto -mb-1 text-blue-weak-200 dark:text-text-dark" />
            </>
          ) : (
            <IoCaretDown className="mx-auto -mb-1 text-blue-weak-200 dark:text-text-dark" />
          )}
        </>
      )}
    </div>
  );
}
