import { LoaderArgs } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { useState } from 'react';
import { MdArrowDropDown, MdArrowDropUp } from 'react-icons/md';
import { Table, TableBody, TableCell, TableHeadRow, TableRow } from '~/components/Table';
import { capitalizeString } from '~/utils/general';
import { redirectIfNotLoggedIn } from '~/utils/loaders';
import { processApiError } from '~/utils/request-helpers';
import BackToContribute from '../BackToContribute';
import { PointInfo } from '../scoreboard';
import {
  getYourComicProblems,
  getYourComicSuggestions,
  getYourContributedComics,
  getYourTagSuggestions,
} from './data-fetchers';

export type ContributionStatus = 'pending' | 'approved' | 'rejected';

export interface ContributionBase {
  comicName: string;
  status: ContributionStatus;
  timestamp: string;
  points?: number;
  pointsDescription?: string;
  modComment?: string;
}

export interface ComicSuggestion extends ContributionBase {
  type: 'ComicSuggestion';
}

export interface ContributedComic extends ContributionBase {
  type: 'ContributedComic';
  artistName: string;
  numberOfPages: number;
  numberOfKeywords: number;
}

export interface TagSuggestion extends ContributionBase {
  type: 'TagSuggestion';
  suggestion: string;
}

export interface ComicProblem extends ContributionBase {
  type: 'ComicProblem';
  problemCategory: string;
}

export type Contribution =
  | ComicSuggestion
  | ContributedComic
  | TagSuggestion
  | ComicProblem;

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
            <TableCell>Contribution Details</TableCell>
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
                <TableCell>
                  <p className="font-extralight">{contribution.modComment || '-'}</p>
                </TableCell>
                <TableCell>
                  <p className="font-extralight">
                    {getContributionDetails(contribution)}
                  </p>
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

export async function loader(args: LoaderArgs) {
  const urlBase: string = args.context.DB_API_URL_BASE as string;
  const user = await redirectIfNotLoggedIn(args);

  const uploadedComicsPromise = getYourContributedComics(urlBase, user.userId);
  const tagSuggestionsPromise = getYourTagSuggestions(urlBase, user.userId);
  const comicProblemsPromise = getYourComicProblems(urlBase, user.userId);
  const comicSuggestionsPromise = getYourComicSuggestions(urlBase, user.userId);

  const resolvedPromises = await Promise.all([
    uploadedComicsPromise,
    tagSuggestionsPromise,
    comicProblemsPromise,
    comicSuggestionsPromise,
  ]);

  for (const promise of resolvedPromises) {
    if (promise.err || !promise.contributions) {
      return processApiError(
        'Error getting your contributions',
        promise.err || { logMessage: 'Contributions returned as null' },
        {
          userId: user.userId,
        }
      );
    }
  }

  let contributions = resolvedPromises
    .map(res => res.contributions)
    .flat() as Contribution[];

  contributions = contributions.sort((a, b) => {
    return a.timestamp.localeCompare(b.timestamp, undefined, {}) * -1;
  });

  return {
    contributions,
  };
}

function getContributionDetails(contribution: Contribution) {
  switch (contribution.type) {
    case 'ContributedComic':
      return (
        <>
          <p>Comic: {contribution.comicName}</p>
          <p>Artist: {contribution.artistName}</p>
          <p>
            {contribution.numberOfPages} pages, {contribution.numberOfKeywords} tags
          </p>
        </>
      );
    case 'ComicProblem':
      return (
        <>
          <p>Comic: {contribution.comicName}</p>
          <p>Problem: {contribution.problemCategory}</p>
        </>
      );
    case 'ComicSuggestion':
      return (
        <>
          <p>Comic name: {contribution.comicName}</p>
        </>
      );
    case 'TagSuggestion':
      return (
        <>
          <p>Comic: {contribution.comicName}</p>
          <p>Tag: {contribution.suggestion}</p>
        </>
      );
    default:
      return '-';
  }
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
  }
}

function getDate(timestamp: string): string {
  const d = new Date(timestamp);
  const mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d);
  const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);

  return `${mo} ${da}`;
}
