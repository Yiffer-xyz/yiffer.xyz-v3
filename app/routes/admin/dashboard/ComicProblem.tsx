import { useState } from 'react';
import { IoCaretDown, IoCaretUp } from 'react-icons/io5';
import DropdownButton from '~/components/Buttons/DropdownButton';
import LoadingButton from '~/components/Buttons/LoadingButton';
import Chip from '~/components/Chip';
import { DashboardAction } from '~/routes/api/admin/dashboard-data';
import { getTimeAgo } from '.';

type ComicProblemProps = {
  action: DashboardAction;
  isLoading: boolean;
  onAssignMe: (action: DashboardAction) => void;
  onUnassignMe: (action: DashboardAction) => void;
  onProcessed: (action: DashboardAction, isApproved: boolean) => void;
  loadingAction?: string;
  isAssignedToOther?: boolean;
  isAssignedToMe?: boolean;
  innerContainerClassName: string;
};

export function ComicProblem({
  action,
  isLoading,
  onAssignMe,
  onUnassignMe,
  onProcessed,
  loadingAction,
  isAssignedToOther,
  isAssignedToMe,
  innerContainerClassName,
}: ComicProblemProps) {
  const [isOpen, setIsOpen] = useState(false);

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
          <Chip color="#cd9831" text="Comic problem" />
          <div className="flex flex-col md:flex-row gap-x-12 gap-y-1">
            <p>
              <b>{action.primaryField}</b>
            </p>
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
          {isAssignedToOther && (
            <p>
              <i>Assigned to: {action.assignedMod!.username}</i>
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
                    text: 'Remove, irrelevant',
                    onClick: () => onProcessed(action, false),
                  },
                  {
                    text: 'Completed',
                    onClick: () => onProcessed(action, true),
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
              />
            )}
          </div>
        </div>
      </div>

      {isOpen ? (
        <>
          <p
            className="whitespace-pre-wrap cursor-auto"
            onClick={e => e.stopPropagation()}
          >
            {action.description}
          </p>

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
    </div>
  );
}
