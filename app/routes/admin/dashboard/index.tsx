import { LoaderArgs } from '@remix-run/cloudflare';
import { useFetcher, useLoaderData } from '@remix-run/react';
import {
  getComicSuggestions,
  getComicUploads,
  getProblems,
  getTagSuggestions,
} from './data-fetchers';
import InfoBox from '~/components/InfoBox';
import LoadingButton from '~/components/Buttons/LoadingButton';
import { authLoader } from '~/utils/loaders';
import { UserSession } from '~/types/types';
import { ProcessTagSuggestionBody } from '~/routes/api/admin/process-tag-suggestion';
import { useState } from 'react';

type UserOrIP = {
  username?: string;
  userId?: number;
  ip?: string;
};

type UsernameAndUserId = {
  username: string;
  userId: number;
};

export type DashboardAction = {
  type: 'tagSuggestion' | 'comicProblem' | 'comicSuggestion' | 'comicUpload';
  id: number;
  primaryField: string;
  secondaryField?: string;
  description?: string;
  isProcessed: boolean;
  timestamp: string;
  assignedMod?: UsernameAndUserId;
  user: UserOrIP;
  verdict?: string; // the result of the mod processing (eg. "approved", "rejected - comment 'asdasd'")
};

export type TagSuggestionAction = DashboardAction & {
  isAdding: boolean;
  tagId: number;
  comicId: number;
};

export async function loader(args: LoaderArgs) {
  const urlBase = args.context.DB_API_URL_BASE as string;

  const user = await authLoader(args);

  // TODO: Should have a max cap on these things, hmm. Can make it relatively high i suppose,
  // It's an issue since we can only limit each thing separately, not the whole list.
  // Figure out later.
  const [tagSuggestions, problems, uploads, comicSuggestions] = await Promise.all([
    getTagSuggestions(urlBase),
    getProblems(urlBase),
    getComicUploads(urlBase),
    getComicSuggestions(urlBase),
  ]);

  const allSuggestions = [
    ...tagSuggestions,
    ...problems,
    ...uploads,
    ...comicSuggestions,
  ];

  allSuggestions.sort((a, b) => {
    return a.timestamp.localeCompare(b.timestamp, undefined, {}) * -1;
  });

  return {
    allSuggestions,
    user: user.user as UserSession,
  };
}

export { ErrorBoundary } from '../../error';

export default function Dashboard({}) {
  const { allSuggestions, user } = useLoaderData<typeof loader>();
  // TODO: The two below are for showing loading states on the buttons.
  // The first to check the element and the 2nd to check which button was
  // actually pressed (like, approve or reject for example)
  const [latestSubmittedId, setLatestSubmittedId] = useState<number>();
  const [latestSubmittedAction, setLatestSubmittedAction] = useState<string>();
  const processTagFetcher = useFetcher();

  function processTagSuggestion(action: TagSuggestionAction, isApproved: boolean) {
    const body: ProcessTagSuggestionBody = {
      isApproved,
      actionId: action.id,
      isAdding: action.isAdding,
      comicId: action.comicId,
      tagId: action.tagId,
    };

    setLatestSubmittedId(action.id);
    setLatestSubmittedAction(isApproved ? 'approve' : 'reject');
    processTagFetcher.submit(
      { body: JSON.stringify(body) },
      { method: 'post', action: '/api/admin/process-tag-suggestion' }
    );
  }

  return (
    <>
      <h1>Action dashboard</h1>

      <InfoBox variant="info">
        Notes for whomever will implement: I BELIEVE all API routes for the actions you
        can do from this pages have already been created. Check the imports/stuff in
        './actions.ts':
        <ul>
          <li>assignActionToMod</li>
          <li>unassignActionFromMod</li>
          <li>processComicProblem</li>
          <li>processComicSuggestion</li>
        </ul>
        <br />
        However, for submitting/acting you might need to create a new type to expand upon
        the DashboardAction type, as has been done with TagSuggestionAction. You can see
        how it's done in the type <pre>TagSuggestionAction</pre> combined with how the
        fields are populated in the <pre>data-fetchers.ts</pre>.
        <br />
        <br />
        Note that you need to create routes for them first, as in{' '}
        <pre>process-tag-suggestions.ts</pre>, in api/admin. Then call the funcs above
        from there. Just look at how tagsuggestions did it and do the same, basically.
        With stringifying the formdata body, creating the type contained, etc.
        <br />
        <br />
        The tag suggestions are safe to approve/reject, the back-end has been set to just
        wait 2 sec then do nothing.
      </InfoBox>

      {allSuggestions.map(action => (
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

          {/* TODO: the rest here and remove the one below */}

          {action.type !== 'tagSuggestion' && (
            <>
              <h2>
                {action.primaryField} ({action.type})
              </h2>
              <pre>
                <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {JSON.stringify(action)}
                </p>
              </pre>
            </>
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
          isLoading={isLoading && loadingAction === 'approve'}
        />
        <LoadingButton
          color="error"
          onClick={() => onProcessSuggestion(action, false)}
          text="Reject"
          isLoading={isLoading && loadingAction === 'reject'}
        />
      </div>
    </>
  );
}
