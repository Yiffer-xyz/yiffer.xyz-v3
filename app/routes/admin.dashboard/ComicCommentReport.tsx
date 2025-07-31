import { useState } from 'react';
import { IoCaretDown, IoCaretUp } from 'react-icons/io5';
import DropdownButton from '~/ui-components/Buttons/DropdownButton';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import Chip from '~/ui-components/Chip';
import type { DashboardAction } from '../api.admin.dashboard-data';
import { useUIPreferences } from '~/utils/theme-provider';
import Link from '~/ui-components/Link';
import { getTimeAgo } from '~/utils/date-utils';
import Username from '~/ui-components/Username';

type ComicCommentReportProps = {
  action: DashboardAction;
  isLoading: boolean;
  onAssignMe: (action: DashboardAction) => void;
  onUnassignMe: (action: DashboardAction) => void;
  onProcessed: (action: DashboardAction, shouldHideComment: boolean) => void;
  loadingAction?: string;
  isAssignedToOther?: boolean;
  isAssignedToMe?: boolean;
  innerContainerClassName: string;
  blockActions?: boolean;
  pagesPath: string;
};

export function ComicCommentReport({
  action,
  isLoading,
  onAssignMe,
  onUnassignMe,
  onProcessed,
  loadingAction,
  isAssignedToOther,
  isAssignedToMe,
  innerContainerClassName,
  blockActions,
  pagesPath,
}: ComicCommentReportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useUIPreferences();
  const themedColor = theme === 'light' ? '#87d57a' : '#469b38';

  const isChooseActionButtonLoading =
    isLoading &&
    !!loadingAction &&
    ['unassign', 'process-problem'].includes(loadingAction);

  return (
    <div
      className="flex flex-col w-full gap-2 cursor-pointer"
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className={innerContainerClassName}>
        <div className="flex flex-col justify-between gap-2">
          <Chip color={themedColor} text="Comment report" />
          <div className="flex flex-col md:flex-row gap-x-12 gap-y-1">
            <div className="flex flex-row gap-x-3 flex-wrap">
              <b>{action.primaryField}</b>
              <Link
                href={`/admin/comics/${action.comicId}`}
                text="Admin"
                showRightArrow
              />
              <Link href={`/c/${action.primaryField}`} text="Live" showRightArrow />
            </div>
            <p>{action.secondaryField}</p>
          </div>
        </div>

        <div className="flex flex-col md:items-end justify-between gap-2 shrink-0">
          <div className="flex flex-row gap-x-1">
            {action.user.username && action.user.userId ? (
              <Username
                id={action.user.userId}
                username={action.user.username}
                pagesPath={pagesPath}
                textClassName="text-sm"
                className="-mt-[3px]"
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
              <DropdownButton
                text="Choose action"
                color="primary"
                isLoading={isChooseActionButtonLoading}
                options={[
                  {
                    text: 'Unassign from me',
                    onClick: () => onUnassignMe(action),
                  },
                  {
                    text: 'Remove comment',
                    onClick: () => onProcessed(action, true),
                  },
                  {
                    text: 'Keep comment',
                    onClick: () => onProcessed(action, false),
                  },
                ]}
              />
            )}
            {!action.isProcessed && !action.assignedMod && (
              <LoadingButton
                color="primary"
                onClick={e => {
                  e.stopPropagation();
                  onAssignMe(action);
                }}
                text="I'm on it"
                isLoading={isLoading && loadingAction === 'assign'}
                disabled={blockActions}
              />
            )}
          </div>
        </div>
      </div>

      {isOpen ? (
        <>
          <p className="font-semibold -mb-2">Comment:</p>
          <p
            className="whitespace-pre-wrap cursor-auto text-sm"
            onClick={e => e.stopPropagation()}
          >
            {action.description}
          </p>

          <IoCaretUp className="mx-auto -mb-1 text-blue-weak-200 dark:text-text-dark" />
        </>
      ) : (
        <IoCaretDown className="mx-auto -mb-1 text-blue-weak-200 dark:text-text-dark" />
      )}
    </div>
  );
}
