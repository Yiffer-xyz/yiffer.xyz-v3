import { LoaderFunction } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { mergeLoaders } from '~/utils/loaders';

interface UserOrIP {
  username?: string;
  userId?: number;
  ip?: string;
}

interface Action {
  type: 'tagSuggestion' | 'comicProblem' | 'comicSuggestion' | 'comicUpload';
  id: number;
  primaryField: string;
  secondaryField?: string;
  description?: string;
  isProcessed: boolean;
  timestamp: string;
  assignedModName?: string;
  user: UserOrIP;
  verdict?: string; // the result of the mod processing (eg. "approved", "rejected - comment 'asdasd'")
}

// import mockDashboardList from './mockdata.json';
// TODO-D1: Implement fetching logic here instead of in old api.
async function getDashboardContent(): Promise<Action[]> {
  return [];
}

const componentLoader: LoaderFunction = async ({ context }) => {
  return await getDashboardContent();
};

// TODO: Add the coming loader for requiring mod login session to this
export const loader = mergeLoaders(componentLoader);
export { ErrorBoundary } from '../../error';

interface ComponentLoaderData {
  dashboardContent: Action[];
}

export default function Dashboard({}) {
  const { dashboardContent }: ComponentLoaderData = useLoaderData();

  return (
    <>
      <h1>Action dashboard</h1>
      <p>
        Content: <pre>{JSON.stringify(dashboardContent, null, 2)}</pre>
      </p>
    </>
  );
}
