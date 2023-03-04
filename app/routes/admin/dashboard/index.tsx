import { LoaderArgs } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';

interface UserOrIP {
  username?: string;
  userId?: number;
  ip?: string;
}

interface DashboardAction {
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
async function getDashboardContent(): Promise<DashboardAction[]> {
  return [];
}

export async function loader(args: LoaderArgs) {
  return await getDashboardContent();
}

export { ErrorBoundary } from '../../error';

export default function Dashboard({}) {
  const dashboardContent = useLoaderData<typeof loader>();

  return (
    <>
      <h1>Action dashboard</h1>
      <p>
        Content: <pre>{JSON.stringify(dashboardContent, null, 2)}</pre>
      </p>
    </>
  );
}
