import { useState } from 'react';
import { IoCaretDown, IoCaretUp } from 'react-icons/io5';
import { MdOpenInNew } from 'react-icons/md';
import LoadingButton from '~/components/Buttons/LoadingButton';
import Chip from '~/components/Chip';
import Link from '~/components/Link';
import { DashboardAction } from '~/routes/api/admin/dashboard-data';
import { ComicSuggestionVerdict } from '~/types/types';
import { getTimeAgo } from '.';

type ComicSuggestionProps = {
  action: DashboardAction;
  isLoading: boolean;
  onAssignMe: (action: DashboardAction) => void;
  onUnassignMe: (action: DashboardAction) => void;
  onProcessed: (
    action: DashboardAction,
    isApproved: boolean,
    verdict?: ComicSuggestionVerdict,
    modComment?: string
  ) => void;
  loadingAction?: string;
  isAssignedToOther?: boolean;
  isAssignedToMe?: boolean;
  innerContainerClassName: string;
};

export function ComicSuggestion({
  action,
  isLoading,
  onAssignMe,
  onUnassignMe,
  onProcessed,
  loadingAction,
  isAssignedToOther,
  isAssignedToMe,
  innerContainerClassName,
}: ComicSuggestionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="flex flex-col w-full gap-2 cursor-pointer"
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className={innerContainerClassName}>
        <div className="flex flex-col justify-between gap-2">
          <Chip color="#c54b8d" text="Comic suggestion" />
          <div className="flex flex-col md:flex-row gap-x-12 gap-y-1">
            <p>
              <b>{action.primaryField}</b>
            </p>
            <p>{action.secondaryField}</p>
          </div>
        </div>

        <div className="flex flex-col md:items-end justify-between gap-2 flex-shrink-0">
          <p className="text-sm ">
            {action.user.username || action.user.ip}
            {' - '}
            {getTimeAgo(action.timestamp)}
          </p>

          <div className="flex flex-row gap-2 self-end">
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
            {isAssignedToMe && (
              <LoadingButton
                color="error"
                onClick={() => onUnassignMe(action)}
                text="Unassign from me"
                isLoading={isLoading && loadingAction === 'unassign'}
              />
            )}
            {!action.isProcessed && !action.assignedMod && (
              <LoadingButton
                color="primary"
                onClick={() => onAssignMe(action)}
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
