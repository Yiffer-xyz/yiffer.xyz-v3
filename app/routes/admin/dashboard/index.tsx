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

export type TagSuggestionAction = DashboardAction & {
  isAdding: boolean;
  tagId: number;
  comicId: number;
};

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
      comicId: action.comicId,
      tagId: action.tagId,
    };

    setLatestSubmittedId(action.id);
    setLatestSubmittedAction(isApproved ? 'approve-tag' : 'reject-tag');
    processTagFetcher.submit(
      { body: JSON.stringify(body) },
      { method: 'post', action: '/api/admin/process-tag-suggestion' }
    );
  }

  // TODO: USE IT (not tested)
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

  // TODO: USE IT (not tested)
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

  // TODO: USE IT (not tested)
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
    setLatestSubmittedAction(isApproved ? 'approve-upload' : 'reject-upload');
    comicSuggestionFetcher.submit(
      { body: JSON.stringify(body) },
      { method: 'post', action: '/api/admin/process-comic-upload' }
    );
  }

  return (
    <>
      <h1>Action dashboard</h1>

      <InfoBox variant="info">
        The tag suggestions are safe to approve/reject, the back-end has been set to just
        wait 2 sec then do nothing.
      </InfoBox>

      {allDashboardItems.length === 0 && (
        <>
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div className="w-full h-28 mb-3 bg-gray-900 dark:bg-gray-300 rounded" />
            ))}
        </>
      )}

      {allDashboardItems.map(action => (
        <div className="border border-theme1-primary my-4 w-full">
          {action.type === 'tagSuggestion' && (
            <TagSuggestion
              action={action as TagSuggestionAction}
              onProcessSuggestion={processTagSuggestion}
              loadingAction={latestSubmittedAction}
              isLoading={
                latestSubmittedId === action.id &&
                processTagFetcher.state === 'submitting'
              }
            />
          )}

          {action.type !== 'tagSuggestion' && (
            <div className="flex flex-row space-between" key={action.id}>
              <div>
                <Chip color="#51bac8" text="Tag suggestion" />
                {/* <Link href={`/comic/${action.}`}> */}
              </div>
              <div></div>
              <h2>
                {action.primaryField} ({action.type})
              </h2>
              <pre>
                <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {JSON.stringify(action)}
                </p>
              </pre>
            </div>
          )}
        </div>
      ))}
    </>
  );
}

type TagSuggestionProps = {
  action: TagSuggestionAction;
  onProcessSuggestion: (action: TagSuggestionAction, isApproved: boolean) => void;
  isLoading: boolean;
  loadingAction?: string;
};

function TagSuggestion({
  action,
  onProcessSuggestion,
  isLoading,
  loadingAction,
}: TagSuggestionProps) {
  return (
    <>
      <h2>
        {action.primaryField} ({action.type})
      </h2>
      <pre>
        <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {JSON.stringify(action)}
        </p>
      </pre>
      <div>
        <LoadingButton
          color="primary"
          onClick={() => onProcessSuggestion(action, true)}
          text="Approve"
          isLoading={isLoading && loadingAction === 'approve-tag'}
        />
        <LoadingButton
          color="error"
          onClick={() => onProcessSuggestion(action, false)}
          text="Reject"
          isLoading={isLoading && loadingAction === 'reject-tag'}
        />
      </div>
    </>
  );
}
