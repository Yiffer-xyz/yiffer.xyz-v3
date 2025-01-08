import { useLoaderData } from '@remix-run/react';
import { redirectIfNotLoggedIn } from '~/utils/loaders';
import { makeDbErr, processApiError } from '~/utils/request-helpers';
import type {
  DbComicProblem,
  DbComicSuggestion,
  DbContributedComic,
  DbTagSuggestion,
} from './data-fetchers';
import {
  mapDBComicProblems,
  mapDBTagSuggestions,
  mapDbComicSuggestions,
  mapDbContributedComics,
  yourComicProblemsQuery,
  yourComicSuggestionsQuery,
  yourContributedComicsQuery,
  yourTagSuggestionsQuery,
} from './data-fetchers';
import type { Contribution } from '~/types/types';
import type { QueryWithParams } from '~/utils/database-facade';
import { queryDbMultiple } from '~/utils/database-facade';
import Breadcrumbs from '~/ui-components/Breadcrumbs/Breadcrumbs';
import ContributionPointInfo from '~/ui-components/ContributionPointInfo';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { Contributions } from '~/page-components/Contributions/Contributions';
export { YifferErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction = () => {
  return [{ title: `Your contributions | Yiffer.xyz` }];
};

export default function YourContributions() {
  const { contributions }: { contributions: Array<Contribution> } = useLoaderData();

  return (
    <div className="container mx-auto pb-8">
      <h1>Your contributions</h1>

      <Breadcrumbs
        prevRoutes={[{ text: 'Contribute', href: '/contribute' }]}
        currentRoute="Your contributions"
      />

      <ContributionPointInfo showInfoAboutUploadedComics />

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

  const dbStatements: QueryWithParams[] = [
    {
      query: yourContributedComicsQuery,
      params: [user.userId],
      queryName: 'Your contributions, comics',
    },
    {
      query: yourTagSuggestionsQuery,
      params: [user.userId],
      queryName: 'Your contributions, tag suggestions',
    },
    {
      query: yourComicProblemsQuery,
      params: [user.userId],
      queryName: 'Your contributions, comic problems',
    },
    {
      query: yourComicSuggestionsQuery,
      params: [user.userId],
      queryName: 'Your contributions, comic suggestions',
    },
  ];

  const dbRes = await queryDbMultiple<
    [DbContributedComic[], DbTagSuggestion[], DbComicProblem[], DbComicSuggestion[]]
  >(args.context.cloudflare.env.DB, dbStatements);

  if (dbRes.isError) {
    return processApiError(
      'Error getting your contributions',
      makeDbErr(dbRes, 'Error getting combo of contributions', { userId: user.userId })
    );
  }

  let contributions: Contribution[] = [
    ...mapDbContributedComics(dbRes.result[0]),
    ...mapDBTagSuggestions(dbRes.result[1]),
    ...mapDBComicProblems(dbRes.result[2]),
    ...mapDbComicSuggestions(dbRes.result[3]),
  ];

  contributions = contributions.sort((a, b) => {
    return b.timestamp.getTime() - a.timestamp.getTime();
  });

  return {
    contributions,
  };
}
