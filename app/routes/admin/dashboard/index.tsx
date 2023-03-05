import { LoaderArgs } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import {
  getComicSuggestions,
  getComicUploads,
  getProblems,
  getTagSuggestions,
} from './data-fetchers';

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

export async function loader(args: LoaderArgs) {
  const urlBase = args.context.DB_API_URL_BASE as string;

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
  };
}

export { ErrorBoundary } from '../../error';

export default function Dashboard({}) {
  const dashboardContent = useLoaderData<typeof loader>();

  return (
    <>
      <h1>Action dashboard</h1>
      {dashboardContent.allSuggestions.map(suggestion => (
        <div key={suggestion.id} className="border border-theme1-primary my-4 w-full">
          <h2>
            {suggestion.primaryField} ({suggestion.type})
          </h2>
          <pre>
            <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {JSON.stringify(suggestion)}
            </p>
          </pre>
        </div>
      ))}
    </>
  );
}
