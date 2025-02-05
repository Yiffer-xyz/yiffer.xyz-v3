import { useLoaderData } from '@remix-run/react';
import { redirectIfNotLoggedIn } from '~/utils/loaders';
import { processApiError } from '~/utils/request-helpers';
import Breadcrumbs from '~/ui-components/Breadcrumbs/Breadcrumbs';
import ContributionPointInfo from '~/ui-components/ContributionPointInfo';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { Contributions } from '~/page-components/Contributions/Contributions';
import { getContributions } from '~/route-funcs/get-contributions';
export { YifferErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction = () => {
  return [{ title: `Your contributions | Yiffer.xyz` }];
};

export default function YourContributions() {
  const { contributions } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto pb-8">
      <h1>Your contributions</h1>

      <Breadcrumbs
        prevRoutes={[{ text: 'Contribute', href: '/contribute' }]}
        currentRoute="Your contributions"
      />

      <ContributionPointInfo />

      {contributions.length > 0 && (
        <Contributions contributions={contributions} className="mt-4" />
      )}

      {contributions.length === 0 && (
        <p className="text-center mt-8">You have no contributions yet.</p>
      )}
    </div>
  );
}

export async function loader(args: LoaderFunctionArgs) {
  const user = await redirectIfNotLoggedIn(args);

  const contributionsRes = await getContributions(
    args.context.cloudflare.env.DB,
    user.userId
  );

  if (contributionsRes.err) {
    return processApiError('Error getting your contributions', contributionsRes.err);
  }

  return {
    contributions: contributionsRes.result,
  };
}
