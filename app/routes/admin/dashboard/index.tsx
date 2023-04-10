import { LoaderArgs } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { redirectIfNotMod } from '~/utils/loaders';
import { ProcessTagSuggestionBody } from '~/routes/api/admin/process-tag-suggestion';
import { useMemo, useState } from 'react';
import { AssignActionBody } from '~/routes/api/admin/assign-action';
import { UnAssignActionBody } from '~/routes/api/admin/unassign-action';
import { ProcessComicProblemBody } from '~/routes/api/admin/process-comic-problem';
import { ProcessComicSuggestionBody } from '~/routes/api/admin/process-comic-suggestion';
import { ComicSuggestionVerdict } from '~/types/types';
import { DashboardAction, DashboardActionType } from '~/routes/api/admin/dashboard-data';
import { formatDistanceToNow } from 'date-fns';
import { TagSuggestion, TagSuggestionAction } from './TagSuggestion';
import { ComicUpload } from './ComicUpload';
import { ComicSuggestion } from './ComicSuggestion';
import Checkbox from '~/components/Checkbox/Checkbox';
import Button from '~/components/Buttons/Button';
import { ComicProblem } from './ComicProblem';
import { PendingComicProblem } from './PendingComicProblem';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import InfoBox from '~/components/InfoBox';

export async function loader(args: LoaderArgs) {
  const user = await redirectIfNotMod(args);
  return { user };
}

export { ErrorBoundary } from '../../error';

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

export default function Dashboard({}) {
  const { user } = useLoaderData<typeof loader>();
  // TODO: The two below are for showing loading states on the buttons.
  // The first to check the element and the 2nd to check which button was
  // actually pressed (like, approve or reject for example)
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
    toastError: true,
  });
  const assignModFetcher = useGoodFetcher({
    url: '/api/admin/assign-action',
    method: 'post',
    toastError: true,
  });
  const unassignModFetcher = useGoodFetcher({
    url: '/api/admin/unassign-action',
    method: 'post',
    toastError: true,
  });
  const problemFetcher = useGoodFetcher({
    url: '/api/admin/process-comic-problem',
    method: 'post',
    toastSuccessMessage: 'Problem processed',
    toastError: true,
  });
  const comicSuggestionFetcher = useGoodFetcher({
    url: '/api/admin/process-comic-suggestion',
    method: 'post',
    toastSuccessMessage: 'Comic suggestion processed',
    toastError: true,
  });

  const allDashboardItems = dashboardDataFetcher.data || [];

  const filteredDashboardItems = useMemo(() => {
    return allDashboardItems.filter(action => {
      if (
        action.assignedMod &&
        action.assignedMod.userId !== user.userId &&
        !showOthersTasks
      ) {
        return false;
      }
      if (action.isProcessed && !showCompleted) return false;
      if (!typeFilter.includes(action.type)) return false;

      return true;
    });
  }, [allDashboardItems, showOthersTasks, showCompleted, typeFilter]);

  async function processTagSuggestion(action: TagSuggestionAction, isApproved: boolean) {
    const body: ProcessTagSuggestionBody = {
      isApproved,
      actionId: action.id,
      isAdding: action.isAdding,
      comicId: action.comicId!,
      tagId: action.tagId,
      suggestingUserId: action.user.userId,
    };

    setLatestSubmittedId(action.id);
    setLatestSubmittedAction(isApproved ? 'approve-tag' : 'reject-tag');
    processTagFetcher.submit({ body: JSON.stringify(body) });
  }

  function assignActionToMod(action: DashboardAction) {
    const body: AssignActionBody = {
      actionId: action.id,
      modId: user.userId,
      actionType: action.type,
    };

    setLatestSubmittedId(action.id);
    setLatestSubmittedAction('assign');
    assignModFetcher.submit({ body: JSON.stringify(body) });
  }

  function unassignActionFromMod(action: DashboardAction) {
    const body: UnAssignActionBody = {
      actionId: action.id,
      actionType: action.type,
    };

    setLatestSubmittedId(action.id);
    setLatestSubmittedAction('unassign');
    unassignModFetcher.submit({ body: JSON.stringify(body) });
  }

  function processComicProblem(action: DashboardAction, isApproved: boolean) {
    const body: ProcessComicProblemBody = {
      isApproved,
      actionId: action.id,
      reportingUserId: action.user.userId,
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
    const body: ProcessComicSuggestionBody = {
      actionId: action.id,
      isApproved,
      verdict, // always if approved, otherwise none
      modComment, // only potentially if rejected
      suggestingUserId: action.user.userId,
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

      {allDashboardItems.length === 0 && !dashboardDataFetcher.hasFetchedOnce && (
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

      {dashboardDataFetcher.error && (
        <InfoBox
          variant="error"
          text={`Error: ${dashboardDataFetcher.error}`}
          className="mt-4"
        />
      )}

      {filteredDashboardItems.map(action => {
        const isAssignedToOther =
          !action.isProcessed &&
          action.assignedMod &&
          action.assignedMod.userId !== user.userId;

        const isAssignedToMe =
          !action.isProcessed &&
          action.assignedMod &&
          action.assignedMod.userId === user.userId;

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
            key={action.id}
            className={`p-3 w-full mb-4 max-w-3xl rounded 
              ${assignationBgClass}
            `}
          >
            {action.type === 'tagSuggestion' && (
              <TagSuggestion
                action={action as TagSuggestionAction}
                onProcessSuggestion={processTagSuggestion}
                loadingAction={latestSubmittedAction}
                isLoading={latestSubmittedId === action.id && processTagFetcher.isLoading}
                innerContainerClassName={innerContainerClassName}
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
              />
            )}
          </div>
        );
      })}
    </>
  );
}

export function getTimeAgo(time: string) {
  const timeAgo = formatDistanceToNow(new Date(time), {
    addSuffix: false,
  });

  return timeAgo;
}
