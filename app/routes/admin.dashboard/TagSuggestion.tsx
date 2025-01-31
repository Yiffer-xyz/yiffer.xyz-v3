import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import Chip from '~/ui-components/Chip';
import Link from '~/ui-components/Link';
import type { DashboardAction } from '../api.admin.dashboard-data';
import { useUIPreferences } from '~/utils/theme-provider';
import { getTimeAgo } from '~/utils/date-utils';
import type { TagSuggestionItem } from '~/types/types';
import { useCallback, useState } from 'react';
import { IoCaretDown, IoCaretUp } from 'react-icons/io5';
import TagSuggestionProcessor from '~/page-components/TagSuggestionProcessor/TagSuggestionProcessor';

export type TagSuggestionAction = DashboardAction & {
  addTags: TagSuggestionItem[];
  removeTags: TagSuggestionItem[];
};

type TagSuggestionProps = {
  action: TagSuggestionAction;
  onProcessSuggestion: (
    action: TagSuggestionAction,
    processedItems: TagSuggestionItem[]
  ) => void;
  isLoading: boolean;
  onAssignMe: (action: DashboardAction) => void;
  onUnassignMe: (action: DashboardAction) => void;
  isAssignedToOther?: boolean;
  isAssignedToMe?: boolean;
  loadingAction?: string;
  innerContainerClassName: string;
  blockActions?: boolean;
};

export function TagSuggestion({
  action,
  onProcessSuggestion,
  isLoading,
  onAssignMe,
  onUnassignMe,
  isAssignedToOther,
  isAssignedToMe,
  loadingAction,
  innerContainerClassName,
  blockActions,
}: TagSuggestionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useUIPreferences();
  const themedColor = theme === 'light' ? '#51bac8' : '#2299a9';

  const [readyForSubmit, setReadyForSubmit] = useState(false);
  const [updatedItems, setUpdatedItems] = useState<TagSuggestionItem[]>([]);

  const onUpdate = useCallback((verdicts: TagSuggestionItem[], completed: boolean) => {
    setUpdatedItems(verdicts);
    if (completed) setReadyForSubmit(true);
  }, []);

  return (
    <div
      className="flex flex-col w-full gap-2 cursor-pointer"
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className={innerContainerClassName}>
        <div className="flex flex-col justify-between gap-2">
          <Chip color={themedColor} text="Tag suggestion" />
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
            <p>{action.description}</p>
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
              <i>Assigned to: {action.assignedMod?.username}</i>
            </p>
          )}

          <div className="flex flex-row gap-2 self-end">
            {!action.isProcessed && isAssignedToMe && (
              <LoadingButton
                color="primary"
                onClick={e => {
                  e.stopPropagation();
                  onUnassignMe(action);
                }}
                text="Unassign from me"
                isLoading={isLoading && loadingAction === 'unassign'}
              />
            )}
            {!action.isProcessed && !action.assignedMod && (
              <LoadingButton
                color="primary"
                onClick={e => {
                  e.stopPropagation();
                  onAssignMe(action);
                  setIsOpen(true);
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
          <div onClick={e => e.stopPropagation()} className="hover:cursor-auto">
            <TagSuggestionProcessor
              tagSuggestionItem={action}
              onUpdate={onUpdate}
              disableActions={!isAssignedToMe}
            />
          </div>

          {!action.isProcessed && (
            <LoadingButton
              color="primary"
              onClick={() => onProcessSuggestion(action, updatedItems)}
              text="Submit"
              isLoading={isLoading && loadingAction === 'approve'}
              disabled={!readyForSubmit}
              disableElevation
            />
          )}

          <IoCaretUp className="mx-auto -mb-1 text-blue-weak-200 dark:text-text-dark" />
        </>
      ) : (
        <IoCaretDown className="mx-auto -mb-1 text-blue-weak-200 dark:text-text-dark" />
      )}
    </div>
  );
}
