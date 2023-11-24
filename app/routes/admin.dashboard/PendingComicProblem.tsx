import { useState } from 'react';
import { MdOpenInNew } from 'react-icons/md';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import Chip from '~/ui-components/Chip';
import Link from '~/ui-components/Link';
import type { DashboardAction } from '../api.admin.dashboard-data';
import { useTheme } from '~/utils/theme-provider';

type PendingComicProblemProps = {
  action: DashboardAction;
  isLoading: boolean;
  onAssignMe: (action: DashboardAction) => void;
  onUnassignMe: (action: DashboardAction) => void;
  loadingAction?: string;
  isAssignedToOther?: boolean;
  isAssignedToMe?: boolean;
  innerContainerClassName: string;
};

export function PendingComicProblem({
  action,
  isLoading,
  onAssignMe,
  onUnassignMe,
  loadingAction,
  isAssignedToOther,
  isAssignedToMe,
  innerContainerClassName,
}: PendingComicProblemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [theme] = useTheme();
  const themedColor = theme === 'light' ? '#65bf70' : '#268f33';

  return (
    <div
      className={`flex flex-col w-full gap-2 ${
        action.isProcessed ? 'cursor-pointer' : ''
      }`}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className={innerContainerClassName}>
        <div className="flex flex-col justify-between gap-2">
          <Chip color={themedColor} text="Pending problem" />
          <div className="flex flex-col md:flex-row gap-x-12 gap-y-1">
            <Link
              href={`/admin/comics/${action.comicId}`}
              text={action.primaryField}
              IconRight={MdOpenInNew}
              newTab
            />
            <p>{action.secondaryField}</p>
          </div>
        </div>

        <div className="flex flex-col md:items-end justify-between gap-2 flex-shrink-0">
          <p className="text-sm"></p>

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
    </div>
  );
}
