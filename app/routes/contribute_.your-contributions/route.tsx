import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { useState } from 'react';
import { MdArrowDropDown, MdArrowDropUp, MdCheck, MdClose } from 'react-icons/md';
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
import BackToContribute from '~/page-components/BackToContribute';
import { PointInfo } from '../contribute_.scoreboard/route';
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
  Contribution,
  ContributionStatus,
  ContributionTagSuggestion,
} from '~/types/types';
import type { QueryWithParams } from '~/utils/database-facade';
import { queryDbMultiple } from '~/utils/database-facade';
import pluralize from 'pluralize';
import Button from '~/ui-components/Buttons/Button';
import TagElement from '~/ui-components/TagElement/TagElement';

export default function YourContributions() {
  const { contributions }: { contributions: Array<Contribution> } = useLoaderData();
  const [showPointInfo, setShowPointInfo] = useState(false);

  return (
    <section className="flex-col">
      <h1 className="text-center mb-2">Your contributions</h1>
      <p className="text-center mb-4">
        <BackToContribute />
      </p>

      <p className="text-center">
        <button
          onClick={() => setShowPointInfo(!showPointInfo)}
          className={`w-fit h-fit text-blue-weak-200 dark:text-blue-strong-300 font-semibold
          bg-gradient-to-r from-blue-weak-200 to-blue-weak-200
          dark:from-blue-strong-300 dark:to-blue-strong-300 bg-no-repeat
          focus:no-underline cursor-pointer bg-[length:0%_1px] transition-[background-size]
          duration-200 bg-[center_bottom] hover:bg-[length:100%_1px]`}
        >
          {showPointInfo ? 'Hide' : 'Show'} point info{' '}
          {showPointInfo ? <MdArrowDropUp /> : <MdArrowDropDown />}
        </button>
      </p>

      {showPointInfo && <PointInfo showInfoAboutUploadedComics />}

      {contributions.length > 0 && (
        <Table horizontalScroll={true} className="mx-auto mt-8">
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
                key={contribution.comicName + index}
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
                  <p className="font-extralight">{contribution.pointsDescription}</p>
                </TableCell>
                <TableCell className="max-w-[300px]">
                  <p className="font-extralight whitespace-pre-wrap">
                    {contribution.modComment || '-'}
                  </p>
                </TableCell>
                <TableCell className="max-w-[300px] flex flex-col items-end">
                  <ContributionDetails contribution={contribution} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {contributions.length === 0 && (
        <p className="text-center mt-8">You have no contributions yet.</p>
      )}
    </section>
  );
}

export async function loader(args: LoaderFunctionArgs) {
  const user = await redirectIfNotLoggedIn(args);

  const dbStatements: QueryWithParams[] = [
    {
      query: yourContributedComicsQuery,
      params: [user.userId],
    },
    {
      query: yourTagSuggestionsQuery,
      params: [user.userId],
    },
    {
      query: yourComicProblemsQuery,
      params: [user.userId],
    },
    {
      query: yourComicSuggestionsQuery,
      params: [user.userId],
    },
  ];

  const dbRes = await queryDbMultiple<
    [DbContributedComic[], DbTagSuggestion[], DbComicProblem[], DbComicSuggestion[]]
  >(args.context.DB, dbStatements);

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
    return a.timestamp.localeCompare(b.timestamp, undefined, {}) * -1;
  });

  return {
    contributions,
  };
}

function ContributionDetails({ contribution }: { contribution: Contribution }) {
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
    return (
      <>
        <p>Comic: {contribution.comicName}</p>
        <p>Problem: {contribution.problemCategory}</p>
      </>
    );
  } else if (contribution.type === 'ComicSuggestion') {
    return (
      <>
        <p>Comic name: {contribution.comicName}</p>
      </>
    );
  } else if (contribution.type === 'TagSuggestion') {
    return <TagSuggestionDetails contribution={contribution} />;
  }

  return '-';
}

function TagSuggestionDetails({
  contribution,
}: {
  contribution: ContributionTagSuggestion;
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

  console.log(contribution);

  return (
    <>
      <p>Comic: {contribution.comicName}</p>
      <p className={isViewingDetails ? 'mb-2' : ''}>{addRemoveString}</p>

      {isViewingDetails && (
        <>
          {isAdd && (
            <div className="flex flex-row flex-wrap justify-end w-full items-center gap-1">
              <p className="whitespace-pre-wrap text-end mr-1">
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
              className={`flex flex-row flex-wrap justify-end w-full items-center gap-1 ${
                isAdd && 'mt-2'
              }`}
            >
              <p className="whitespace-pre-wrap text-end mr-1">
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
        className={`self-end -mr-3 ${isViewingDetails ? 'mt-1 -mb-1' : '-my-1'}`}
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

function getDate(timestamp: string): string {
  const d = new Date(timestamp);
  const mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d);
  const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);

  return `${mo} ${da}`;
}
