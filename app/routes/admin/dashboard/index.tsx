import { LoaderArgs } from '@remix-run/cloudflare';
import { useFetcher, useLoaderData } from '@remix-run/react';
import InfoBox from '~/components/InfoBox';
import LoadingButton from '~/components/Buttons/LoadingButton';
import { redirectIfNotMod } from '~/utils/loaders';
import { ProcessTagSuggestionBody } from '~/routes/api/admin/process-tag-suggestion';
import { useEffect, useState } from 'react';
import { AssignActionBody } from '~/routes/api/admin/assign-action';
import { UnAssignActionBody } from '~/routes/api/admin/unassign-action';
import { ProcessComicProblemBody } from '~/routes/api/admin/process-comic-problem';
import { ProcessComicSuggestionBody } from '~/routes/api/admin/process-comic-suggestion';
import { ComicSuggestionVerdict } from '~/types/types';
import Chip from '~/components/Chip';
import Link from '~/components/Link';
import { DashboardAction } from '~/routes/api/admin/dashboard-data';
import { MdOpenInNew } from 'react-icons/md';
import { formatDistanceToNow } from 'date-fns';
import { TagSuggestion, TagSuggestionAction } from './TagSuggestion';
import { ComicUpload } from './ComicUpload';
import { ComicSuggestion } from './ComicSuggestion';

export async function loader(args: LoaderArgs) {
  const urlBase = args.context.DB_API_URL_BASE as string;
  const user = await redirectIfNotMod(args);

  return { user };
}

export { ErrorBoundary } from '../../error';

export default function Dashboard({}) {
  const { user } = useLoaderData<typeof loader>();
  // TODO: The two below are for showing loading states on the buttons.
  // The first to check the element and the 2nd to check which button was
  // actually pressed (like, approve or reject for example)
  const [latestSubmittedId, setLatestSubmittedId] = useState<number>();
  const [latestSubmittedAction, setLatestSubmittedAction] = useState<string>();
  const [allDashboardItems, setAllDashboardItems] = useState<DashboardAction[]>([]);

  const dashboardDataFetcher = useFetcher<DashboardAction[]>();
  const processTagFetcher = useFetcher();
  const assignModFetcher = useFetcher();
  const unassignModFetcher = useFetcher();
  const problemFetcher = useFetcher();
  const comicSuggestionFetcher = useFetcher();

  async function fetchDashboardItems() {
    setAllDashboardItems([]);
    dashboardDataFetcher.submit(
      {},
      { method: 'get', action: '/api/admin/dashboard-data' }
    );
  }

  useEffect(() => {
    fetchDashboardItems();
  }, []);

  useEffect(() => {
    if (dashboardDataFetcher.data) {
      setAllDashboardItems(dashboardDataFetcher.data);
    }
  }, [dashboardDataFetcher.data]);

  function processTagSuggestion(action: TagSuggestionAction, isApproved: boolean) {
    const body: ProcessTagSuggestionBody = {
      isApproved,
      actionId: action.id,
      isAdding: action.isAdding,
      comicId: action.comicId!,
      tagId: action.tagId,
    };

    setLatestSubmittedId(action.id);
    setLatestSubmittedAction(isApproved ? 'approve-tag' : 'reject-tag');
    processTagFetcher.submit(
      { body: JSON.stringify(body) },
      { method: 'post', action: '/api/admin/process-tag-suggestion' }
    );
  }

  function assignActionToMod(action: DashboardAction) {
    const body: AssignActionBody = {
      actionId: action.id,
      modId: user.userId,
      actionType: action.type,
    };

    setLatestSubmittedId(action.id);
    setLatestSubmittedAction('assign');

    assignModFetcher.submit(
      { body: JSON.stringify(body) },
      { method: 'post', action: '/api/admin/assign-action' }
    );
  }

  function unassignActionFromMod(action: DashboardAction) {
    const body: UnAssignActionBody = {
      actionId: action.id,
      actionType: action.type,
    };

    setLatestSubmittedId(action.id);
    setLatestSubmittedAction('unassign');
    unassignModFetcher.submit(
      { body: JSON.stringify(body) },
      { method: 'post', action: '/api/admin/unassign-action' }
    );
  }

  // TODO: USE IT (not tested)
  function processComicProblem(action: DashboardAction, isApproved: boolean) {
    const body: ProcessComicProblemBody = {
      isApproved,
      actionId: action.id,
    };

    setLatestSubmittedId(action.id);
    setLatestSubmittedAction(isApproved ? 'approve-problem' : 'reject-problem');
    problemFetcher.submit(
      { body: JSON.stringify(body) },
      { method: 'post', action: '/api/admin/process-comic-problem' }
    );
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
    };

    setLatestSubmittedId(action.id);
    setLatestSubmittedAction('process-upload');
    comicSuggestionFetcher.submit(
      { body: JSON.stringify(body) },
      { method: 'post', action: '/api/admin/process-comic-suggestion' }
    );
  }

  return (
    <>
      <h1>Action dashboard</h1>

      {allDashboardItems.length === 0 && (
        <>
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div className="w-full h-28 mb-3 bg-gray-900 dark:bg-gray-300 rounded" />
            ))}
        </>
      )}

      {allDashboardItems.map(action => {
        const isAssignedToOther =
          !action.isProcessed &&
          action.assignedMod &&
          action.assignedMod.userId !== user.userId;

        const isAssignedToMe =
          !action.isProcessed &&
          action.assignedMod &&
          action.assignedMod.userId === user.userId;

        let assignationBgClass = 'bg-white dark:bg-gray-400 shadow-md';
        if (isAssignedToOther) {
          assignationBgClass = 'bg-gray-900 dark:bg-gray-300';
        }
        if (isAssignedToMe) {
          assignationBgClass =
            'bg-theme1-primaryLessTrans dark:bg-theme1-primaryTrans shadow-md';
        }
        if (action.isProcessed) {
          assignationBgClass = 'bg-gray-800 dark:bg-gray-250';
        }
        const innerContainerClassName = `flex flex-col gap-2 md:flex-row justify-between`;

        return (
          <div
            className={`p-3 w-full mb-4 max-w-3xl rounded 
              ${assignationBgClass}
            `}
          >
            {action.type === 'tagSuggestion' && (
              <TagSuggestion
                action={action as TagSuggestionAction}
                onProcessSuggestion={processTagSuggestion}
                loadingAction={latestSubmittedAction}
                isLoading={
                  latestSubmittedId === action.id &&
                  processTagFetcher.state === 'submitting'
                }
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
                  (assignModFetcher.state === 'submitting' ||
                    unassignModFetcher.state === 'submitting')
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
                  (assignModFetcher.state === 'submitting' ||
                    unassignModFetcher.state === 'submitting' ||
                    comicSuggestionFetcher.state === 'submitting')
                }
                loadingAction={latestSubmittedAction}
                isAssignedToOther={isAssignedToOther}
                isAssignedToMe={isAssignedToMe}
                innerContainerClassName={innerContainerClassName}
              />
            )}

            {!['tagSuggestion', 'comicUpload', 'comicSuggestion'].includes(
              action.type
            ) && (
              <p>a</p>
              // <pre>{JSON.stringify(action, null, 2)}</pre>
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
