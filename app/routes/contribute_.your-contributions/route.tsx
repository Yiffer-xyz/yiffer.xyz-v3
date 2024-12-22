import { useLoaderData } from '@remix-run/react';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHeadRow,
  TableRow,
} from '~/ui-components/Table';
import { capitalizeString } from '~/utils/general';
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
import type {
  ComicProblem,
  Contribution,
  ContributionStatus,
  ContributionTagSuggestion,
} from '~/types/types';
import type { QueryWithParams } from '~/utils/database-facade';
import { queryDbMultiple } from '~/utils/database-facade';
import pluralize from 'pluralize';
import Button from '~/ui-components/Buttons/Button';
import TagElement from '~/ui-components/TagElement/TagElement';
import Breadcrumbs from '~/ui-components/Breadcrumbs/Breadcrumbs';
import ContributionPointInfo from '~/ui-components/ContributionPointInfo';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
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
        <>
          <Table horizontalScroll={true} className="mt-4 hidden md:block">
            <TableHeadRow isTableMaxHeight={false}>
              <TableCell>Contribution</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Points</TableCell>
              <TableCell>Mod comment</TableCell>
              <TableCell className="text-end">Contribution Details</TableCell>
            </TableHeadRow>
            <TableBody>
              {contributions.map((contribution, index) => (
                <TableRow
                  key={index}
                  className="border-b border-gray-800 dark:border-gray-500"
                >
                  <TableCell>
                    <p className="font-extralight">{getContributionName(contribution)}</p>
                  </TableCell>
                  <TableCell>
                    <p
                      className={`${getContributionStatusColor(
                        contribution.status
                      )} font-extralight`}
                    >
                      {capitalizeString(contribution.status)}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="font-extralight">{getDate(contribution.timestamp)}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-semibold">{contribution.points || '-'}</p>
                    <p className="font-extralight whitespace-pre-wrap max-w-[100px]">
                      {contribution.pointsDescription}
                    </p>
                  </TableCell>
                  <TableCell className="max-w-[240px]">
                    <p className="font-extralight whitespace-pre-wrap">
                      {contribution.modComment || '-'}
                    </p>
                  </TableCell>
                  <TableCell className="max-w-[300px] flex flex-col items-end">
                    <ContributionDetails contribution={contribution} alignRight />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 md:hidden">
            {contributions.map((contribution, index) => (
              <div
                key={index}
                className="p-3 w-full mb-4 max-w-3xl rounded bg-white dark:bg-gray-300 shadow-md"
              >
                <div className="flex flex-row justify-between gap-2">
                  <p className="font-semibold">{getContributionName(contribution)}</p>
                  <p className="font-extralight text-sm">
                    {getDate(contribution.timestamp)}
                  </p>
                </div>

                <p
                  className={`${getContributionStatusColor(
                    contribution.status
                  )} font-extralight`}
                >
                  {capitalizeString(contribution.status)}
                </p>

                {contribution.points && contribution.points > 0 ? (
                  <p>
                    <span className="font-semibold">{contribution.points}</span> points
                    {contribution.pointsDescription && (
                      <span className="font-extralight italic text-sm">
                        {` (${contribution.pointsDescription})`}
                      </span>
                    )}
                  </p>
                ) : null}

                {contribution.modComment && (
                  <p className="font-extralight whitespace-pre-wrap text-sm ">
                    Mod comment: {contribution.modComment}
                  </p>
                )}

                <div className="text-sm mt-2">
                  <ContributionDetails contribution={contribution} alignRight={false} />
                </div>
              </div>
            ))}
          </div>
        </>
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

function ContributionDetails({
  contribution,
  alignRight,
}: {
  contribution: Contribution;
  alignRight: boolean;
}) {
  if (contribution.type === 'ContributedComic') {
    return (
      <>
        <p>Comic: {contribution.comicName}</p>
        <p>Artist: {contribution.artistName}</p>
        <p>
          {contribution.numberOfPages} pages, {contribution.numberOfKeywords} tags
        </p>
      </>
    );
  } else if (contribution.type === 'ComicProblem') {
    return <ComicProblemDetails contribution={contribution} alignRight={alignRight} />;
  } else if (contribution.type === 'ComicSuggestion') {
    return (
      <>
        <p>Comic name: {contribution.comicName}</p>
      </>
    );
  } else if (contribution.type === 'TagSuggestion') {
    return <TagSuggestionDetails contribution={contribution} alignRight={alignRight} />;
  }

  return '-';
}

function ComicProblemDetails({
  contribution,
  alignRight,
}: {
  contribution: ComicProblem;
  alignRight: boolean;
}) {
  const [isViewingDetails, setIsViewingDetails] = useState(false);

  return (
    <>
      <p>Comic: {contribution.comicName}</p>
      <p>Problem: {contribution.problemCategory}</p>

      {isViewingDetails && (
        <p
          className={`mt-2 font-extralight whitespace-pre-wrap break-all ${
            alignRight ? 'text-right' : 'text-left'
          }`}
        >
          {contribution.description}
        </p>
      )}

      <Button
        text={isViewingDetails ? 'Hide details' : 'Show details'}
        className={`${alignRight ? 'self-end -mr-3' : 'self-start pl-0'} ${
          isViewingDetails ? 'mt-1 -mb-1' : '-my-1'
        }`}
        variant="naked"
        onClick={() => setIsViewingDetails(!isViewingDetails)}
      />
    </>
  );
}

function TagSuggestionDetails({
  contribution,
  alignRight,
}: {
  contribution: ContributionTagSuggestion;
  alignRight: boolean;
}) {
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const isAdd = contribution.addTags.length > 0;
  const isRemove = contribution.removeTags.length > 0;
  const isBoth = isAdd && isRemove;

  let addRemoveString = '';
  if (isBoth) {
    addRemoveString = `Add ${pluralize(
      'tag',
      contribution.addTags.length,
      true
    )}, remove ${pluralize('tag', contribution.removeTags.length, true)}`;
  } else if (isAdd) {
    addRemoveString = `Add ${pluralize('tag', contribution.addTags.length, true)}`;
  } else if (isRemove) {
    addRemoveString = `Remove ${pluralize('tag', contribution.removeTags.length, true)}`;
  }

  return (
    <>
      <p>Comic: {contribution.comicName}</p>
      <p className={isViewingDetails ? 'mb-2' : ''}>{addRemoveString}</p>

      {isViewingDetails && (
        <>
          {isAdd && (
            <div
              className={`flex flex-row flex-wrap w-full items-center gap-1 ${
                alignRight ? 'justify-end' : 'justify-start'
              }`}
            >
              <p
                className={`whitespace-pre-wrap ${alignRight ? 'text-right' : 'text-left'} mr-1`}
              >
                <b>Add</b>
              </p>
              {contribution.addTags.map(tag => (
                <TagElement
                  tag={{ name: tag.tagName }}
                  key={tag.tagName}
                  approvalState={tag.isApproved === null ? undefined : tag.isApproved}
                  disableHoverEffects
                />
              ))}
            </div>
          )}

          {isRemove && (
            <div
              className={`flex flex-row flex-wrap w-full items-center gap-1 ${
                alignRight ? 'justify-end' : 'justify-start'
              } ${isAdd && 'mt-2'}`}
            >
              <p
                className={`whitespace-pre-wrap ${alignRight ? 'text-right' : 'text-left'} mr-1`}
              >
                <b>Remove</b>
              </p>
              {contribution.removeTags.map(tag => (
                <TagElement
                  tag={{ name: tag.tagName }}
                  key={tag.tagName}
                  approvalState={tag.isApproved === null ? undefined : tag.isApproved}
                  disableHoverEffects
                />
              ))}
            </div>
          )}
        </>
      )}

      <Button
        text={isViewingDetails ? 'Hide details' : 'Show details'}
        className={`${alignRight ? 'self-end -mr-3' : 'self-start pl-0'} ${
          isViewingDetails ? 'mt-1 -mb-1' : '-my-1'
        }`}
        variant="naked"
        onClick={() => setIsViewingDetails(!isViewingDetails)}
      />
    </>
  );
}

function getContributionName(contribution: Contribution) {
  switch (contribution.type) {
    case 'ContributedComic':
      return 'Comic upload';
    case 'ComicSuggestion':
      return 'Comic suggestion';
    case 'ComicProblem':
      return 'Comic problem';
    case 'TagSuggestion':
      return 'Tag suggestion';

    default:
      return 'ERROR';
  }
}

function getContributionStatusColor(status: ContributionStatus): string {
  switch (status) {
    case 'approved':
      return 'text-green-500 dark:text-green-300';
    case 'pending':
      return 'text-blue-800 dark:text-blue-300';
    case 'rejected':
      return 'text-red-500 dark:text-red-300';
    case 'processed':
      return 'text-teal-500 dark:text-teal-300';
  }
}

function getDate(timestamp: Date): string {
  const mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(timestamp);
  const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(timestamp);

  return `${mo} ${da}`;
}
