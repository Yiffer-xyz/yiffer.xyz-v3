import { useOutletContext } from '@remix-run/react';
import { redirectIfNotMod } from '~/utils/loaders';
import type { ProcessTagSuggestionBody } from '../api.admin.process-tag-suggestion';
import { useMemo, useState } from 'react';
import type { AssignActionBody } from '../api.admin.assign-action';
import type { UnAssignActionBody } from '../api.admin.unassign-action';
import type { ProcessComicProblemBody } from '../api.admin.process-comic-problem';
import type { ProcessComicSuggestionBody } from '../api.admin.process-comic-suggestion';
import type { ComicSuggestionVerdict, TagSuggestionItem } from '~/types/types';
import type { DashboardAction, DashboardActionType } from '../api.admin.dashboard-data';
import type { TagSuggestionAction } from './TagSuggestion';
import { TagSuggestion } from './TagSuggestion';
import { ComicUpload } from './ComicUpload';
import { ComicSuggestion } from './ComicSuggestion';
import Checkbox from '~/ui-components/Checkbox/Checkbox';
import Button from '~/ui-components/Buttons/Button';
import { ComicProblem } from './ComicProblem';
import { PendingComicProblem } from './PendingComicProblem';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import type { GlobalAdminContext } from '../admin/route';
export { AdminErrorBoundary as ErrorBoundary } from '~/utils/error';

const allActionTypes: DashboardActionType[] = [
  'tagSuggestion',
  'comicUpload',
  'comicSuggestion',
  'comicProblem',
  'pendingComicProblem',
];

const actionTypeToLabel: Record<DashboardActionType, string> = {
  tagSuggestion: 'Tag suggestions',
  comicUpload: 'Comic uploads',
  comicSuggestion: 'Comic suggestions',
  comicProblem: 'Comic problems',
  pendingComicProblem: 'Pending problems',
};

export async function loader(args: LoaderFunctionArgs) {
  const user = await redirectIfNotMod(args);
  return { user };
}

export default function Dashboard() {
  const globalContext: GlobalAdminContext = useOutletContext();
  const blockActions = globalContext.numUnreadContent > 0;
  const [latestSubmittedId, setLatestSubmittedId] = useState<number>();
  const [latestSubmittedAction, setLatestSubmittedAction] = useState<string>();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [showOthersTasks, setShowOthersTasks] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [typeFilter, setTypeFilter] = useState<DashboardActionType[]>([
    ...allActionTypes,
  ]);

  const dashboardDataFetcher = useGoodFetcher<DashboardAction[]>({
    url: '/api/admin/dashboard-data',
    fetchGetOnLoad: true,
  });
  const processTagFetcher = useGoodFetcher({
    url: '/api/admin/process-tag-suggestion',
    method: 'post',
    toastSuccessMessage: 'Tag suggestion processed',
  });
  const assignModFetcher = useGoodFetcher({
    url: '/api/admin/assign-action',
    method: 'post',
  });
  const unassignModFetcher = useGoodFetcher({
    url: '/api/admin/unassign-action',
    method: 'post',
  });
  const problemFetcher = useGoodFetcher({
    url: '/api/admin/process-comic-problem',
    method: 'post',
    toastSuccessMessage: 'Problem processed',
  });
  const comicSuggestionFetcher = useGoodFetcher({
    url: '/api/admin/process-comic-suggestion',
    method: 'post',
    toastSuccessMessage: 'Comic suggestion processed',
  });

  const filteredDashboardItems = useMemo(() => {
    if (!dashboardDataFetcher.data) return [];

    return dashboardDataFetcher.data.filter(action => {
      if (
        action.assignedMod &&
        action.assignedMod.userId !== globalContext.user.id &&
        !showOthersTasks
      ) {
        return false;
      }
      if (action.isProcessed && !showCompleted) return false;
      if (!typeFilter.includes(action.type)) return false;

      return true;
    });
  }, [
    dashboardDataFetcher.data,
    showOthersTasks,
    showCompleted,
    typeFilter,
    globalContext.user.id,
  ]);

  async function processTagSuggestion(
    action: TagSuggestionAction,
    processedItems: TagSuggestionItem[]
  ) {
    if (!action.comicId || blockActions) return;

    const body: ProcessTagSuggestionBody = {
      comicId: action.comicId,
      suggestionGroupId: action.id,
      suggestingUserId: action.user.userId,
      processedItems,
    };

    setLatestSubmittedId(action.id);
    setLatestSubmittedAction('process-tag-suggestion');
    processTagFetcher.submit({ body: JSON.stringify(body) });
  }

  function assignActionToMod(action: DashboardAction) {
    if (blockActions) return;
    const body: AssignActionBody = {
      actionId: action.id,
      modId: globalContext.user.id,
      actionType: action.type,
    };

    setLatestSubmittedId(action.id);
    setLatestSubmittedAction('assign');
    assignModFetcher.submit({ body: JSON.stringify(body) });
  }

  function unassignActionFromMod(action: DashboardAction) {
    if (blockActions) return;
    const body: UnAssignActionBody = {
      actionId: action.id,
      actionType: action.type,
    };

    setLatestSubmittedId(action.id);
    setLatestSubmittedAction('unassign');
    unassignModFetcher.submit({ body: JSON.stringify(body) });
  }

  function processComicProblem(action: DashboardAction, isApproved: boolean) {
    if (blockActions) return;
    const body: ProcessComicProblemBody = {
      isApproved,
      actionId: action.id,
      reportingUserId: action.user.userId,
      comicId: action.comicId!,
    };

    setLatestSubmittedId(action.id);
    setLatestSubmittedAction('process-problem');
    problemFetcher.submit({ body: JSON.stringify(body) });
  }

  function processComicSuggestion(
    action: DashboardAction,
    isApproved: boolean,
    verdict?: ComicSuggestionVerdict,
    modComment?: string
  ) {
    if (blockActions) return;
    const body: ProcessComicSuggestionBody = {
      actionId: action.id,
      isApproved,
      verdict, // always if approved, otherwise none
      modComment, // only potentially if rejected
      suggestingUserId: action.user.userId,
      comicName: action.primaryField,
    };

    setLatestSubmittedId(action.id);
    setLatestSubmittedAction('process-upload');
    comicSuggestionFetcher.submit({ body: JSON.stringify(body) });
  }

  return (
    <>
      <h1>Action dashboard</h1>

      <Button
        className={`md:hidden mb-3`}
        onClick={() => setShowMobileFilters(!showMobileFilters)}
        text={showMobileFilters ? 'Hide filters' : 'Show filters'}
        variant="outlined"
      />

      <div className={showMobileFilters ? '' : 'hidden md:block'}>
        <div className="flex flex-row flex-wrap mb-3 md:mt-2 gap-x-8 gap-y-1">
          <Checkbox
            label="Show others' tasks"
            checked={showOthersTasks}
            onChange={() => setShowOthersTasks(!showOthersTasks)}
          />

          <Checkbox
            label="Show completed"
            checked={showCompleted}
            onChange={() => setShowCompleted(!showCompleted)}
          />
        </div>
        <div className="flex flex-row flex-wrap mb-4 gap-x-8 gap-y-1">
          {allActionTypes.map(type => (
            <Checkbox
              key={type}
              label={actionTypeToLabel[type]}
              checked={typeFilter.includes(type as DashboardActionType)}
              onChange={() => {
                if (typeFilter.includes(type as DashboardActionType)) {
                  setTypeFilter(typeFilter.filter(t => t !== type));
                } else {
                  setTypeFilter([...typeFilter, type as DashboardActionType]);
                }
              }}
            />
          ))}
        </div>
      </div>

      {!dashboardDataFetcher.data && !dashboardDataFetcher.hasFetchedOnce && (
        <>
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div
                className="w-full max-w-3xl h-20 mb-4 bg-gray-900 dark:bg-gray-300 rounded"
                key={i}
              />
            ))}
        </>
      )}

      {filteredDashboardItems.map(action => {
        const isAssignedToOther =
          !action.isProcessed &&
          action.assignedMod &&
          action.assignedMod.userId !== globalContext.user.id;

        const isAssignedToMe =
          !action.isProcessed &&
          action.assignedMod &&
          action.assignedMod.userId === globalContext.user.id;

        let assignationBgClass = 'bg-white dark:bg-gray-300 shadow-md';
        if (isAssignedToOther || action.isProcessed) {
          assignationBgClass = 'bg-gray-900 dark:bg-gray-250';
        }
        if (isAssignedToMe) {
          assignationBgClass =
            'bg-theme1-primaryLessTrans dark:bg-theme1-primaryTrans shadow-md';
        }
        const innerContainerClassName = `flex flex-col gap-2 md:flex-row justify-between`;

        return (
          <div
            key={`${action.type}-${action.id}`}
            className={`p-3 w-full mb-4 max-w-3xl rounded 
              ${assignationBgClass}
            `}
          >
            {action.type === 'tagSuggestion' && (
              <TagSuggestion
                action={action as TagSuggestionAction}
                onAssignMe={assignActionToMod}
                onUnassignMe={unassignActionFromMod}
                onProcessSuggestion={processTagSuggestion}
                loadingAction={latestSubmittedAction}
                isAssignedToOther={isAssignedToOther}
                isAssignedToMe={isAssignedToMe}
                isLoading={
                  latestSubmittedId === action.id &&
                  (processTagFetcher.isLoading ||
                    assignModFetcher.isLoading ||
                    unassignModFetcher.isLoading)
                }
                innerContainerClassName={innerContainerClassName}
                blockActions={blockActions}
              />
            )}

            {action.type === 'comicUpload' && (
              <ComicUpload
                action={action}
                onAssignMe={assignActionToMod}
                onUnassignMe={unassignActionFromMod}
                isLoading={
                  latestSubmittedId === action.id &&
                  (assignModFetcher.isLoading || unassignModFetcher.isLoading)
                }
                loadingAction={latestSubmittedAction}
                isAssignedToOther={isAssignedToOther}
                isAssignedToMe={isAssignedToMe}
                innerContainerClassName={innerContainerClassName}
                blockActions={blockActions}
              />
            )}

            {action.type === 'comicSuggestion' && (
              <ComicSuggestion
                action={action}
                onAssignMe={assignActionToMod}
                onUnassignMe={unassignActionFromMod}
                onProcessed={processComicSuggestion}
                isLoading={
                  latestSubmittedId === action.id &&
                  (assignModFetcher.isLoading ||
                    unassignModFetcher.isLoading ||
                    comicSuggestionFetcher.isLoading)
                }
                loadingAction={latestSubmittedAction}
                isAssignedToOther={isAssignedToOther}
                isAssignedToMe={isAssignedToMe}
                innerContainerClassName={innerContainerClassName}
                blockActions={blockActions}
              />
            )}

            {action.type === 'comicProblem' && (
              <ComicProblem
                action={action}
                onAssignMe={assignActionToMod}
                onUnassignMe={unassignActionFromMod}
                onProcessed={processComicProblem}
                isLoading={
                  latestSubmittedId === action.id &&
                  (assignModFetcher.isLoading ||
                    unassignModFetcher.isLoading ||
                    problemFetcher.isLoading)
                }
                loadingAction={latestSubmittedAction}
                isAssignedToOther={isAssignedToOther}
                isAssignedToMe={isAssignedToMe}
                innerContainerClassName={innerContainerClassName}
                blockActions={blockActions}
              />
            )}

            {action.type === 'pendingComicProblem' && (
              <PendingComicProblem
                action={action}
                onAssignMe={assignActionToMod}
                onUnassignMe={unassignActionFromMod}
                isLoading={
                  latestSubmittedId === action.id &&
                  (assignModFetcher.isLoading || unassignModFetcher.isLoading)
                }
                loadingAction={latestSubmittedAction}
                isAssignedToOther={isAssignedToOther}
                isAssignedToMe={isAssignedToMe}
                innerContainerClassName={innerContainerClassName}
                blockActions={blockActions}
              />
            )}
          </div>
        );
      })}
    </>
  );
}
