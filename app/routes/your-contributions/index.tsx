import {
  comicProblemsQueryRes,
  keywordSuggestionQueryRes,
  comicSuggestionsQueryRes,
  uploadedComicsQueryRes,
} from '~/mock-data/your-contributions';
import Link from '../../components/Link';
import { MdArrowBack } from 'react-icons/md';
import type { LoaderFunction } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import {Table, TableBody, TableCell, TableHeadRow, TableRow} from '~/components/Table'

export enum ComicStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

export interface ContributionBase {
  comicName: string;
  status: ComicStatus;
  timestamp: string;
  points: number | null;
  pointDescription: string | null;
  modComment: string | null;
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

export type Contribution = ComicSuggestion | ContributedComic | TagSuggestion | ComicProblem;

async function getContributedComics(urlBase: string): Promise<Array<ContributedComic>> {
  return uploadedComicsQueryRes.map(comic => ({
    ...comic,
    type: 'ContributedComic',
  })) as Array<ContributedComic>;
}

async function getTagSuggestions(urlBase: string): Promise<Array<TagSuggestion>> {
  return keywordSuggestionQueryRes.map(tagSuggestion => ({
    ...tagSuggestion,
    type: 'TagSuggestion',
  })) as Array<TagSuggestion>;
}

async function getComicProblems(urlBase: string): Promise<Array<ComicProblem>> {
  return comicProblemsQueryRes.map(comicProblem => ({
    ...comicProblem,
    type: 'ComicProblem',
  })) as Array<ComicProblem>;
}

async function getComicSuggestions(urlBase: string): Promise<Array<ComicSuggestion>> {
  return comicSuggestionsQueryRes.map(comicSuggestion => ({
    ...comicSuggestion,
    type: 'ComicSuggestion',
  })) as Array<ComicSuggestion>;
}

export const loader: LoaderFunction = async function ({ context }) {
  const urlBase: string = context.URL_BASE as string;
  const uploadedComicsPromise = getContributedComics(urlBase);
  const tagSuggestionsPromise = getTagSuggestions(urlBase);
  const comicProblemsPromise = getComicProblems(urlBase);
  const comicSuggestionsPromise = getComicSuggestions(urlBase);

  const [uploadedComicsRes, tagSuggestionsRes, comicProblemsRes, comicSuggestionsRes] = await Promise.all([
    uploadedComicsPromise,
    tagSuggestionsPromise,
    comicProblemsPromise,
    comicSuggestionsPromise
  ]);

  const uploadedComics = uploadedComicsRes;
  const tagSuggestions = tagSuggestionsRes;
  const comicProblems = comicProblemsRes;
  const comicSuggestions = comicSuggestionsRes;

  const contributions = [
    ...uploadedComics,
    ...tagSuggestions,
    ...comicProblems,
    ...comicSuggestions,
  ].sort((a, b) => {
    return a.timestamp.localeCompare(b.timestamp, undefined, {}) * -1;
  });

  return {
    contributions,
  };
};

function getContributionDetails (contribution: Contribution) {
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

function getContributionName (contribution: Contribution) {
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

function getContributionStatusColor (status: ComicStatus): string {
  switch (status) {
    case ComicStatus.APPROVED:
      return 'text-green-500 dark:text-green-300';
    case ComicStatus.PENDING:
      return 'text-blue-800 dark:text-blue-300';
    case ComicStatus.REJECTED:
      return 'text-red-500 dark:text-red-300';
  }
}

function getDate (timestamp: string): string {
  const d = new Date(timestamp);
  const mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d);
  const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);

  return `${mo} ${da}`;
}

export default function YourContributions() {
  const { contributions }: { contributions: Array<Contribution> } = useLoaderData();

  return (
    <section className="flex-col">
      <h1 className="text-center mb-2">Your contributions</h1>
      <p className="text-center">
        <Link href="/" text="Back" Icon={MdArrowBack} />
      </p>
      <p className="mb-4 text-center">
        <Link href="https://yiffer.xyz/" text="To front page" />
      </p>
      <Table horizontalScroll={true} className="mx-auto">
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
          <TableRow key={contribution.comicName + index} className="border-b border-gray-800 dark:border-gray-500">
            <TableCell>
              <p className="font-extralight">{getContributionName(contribution)}</p>
            </TableCell>
            <TableCell>
              <p className={`${getContributionStatusColor(contribution.status)} font-extralight`}>{contribution.status}</p>
            </TableCell>
            <TableCell>
              <p className="font-extralight">{getDate(contribution.timestamp)}</p>
            </TableCell>
            <TableCell>
              <p className="font-semibold">{contribution.points || '-'}</p>
              <p className="font-extralight">{contribution.pointDescription}</p>
            </TableCell>
            <TableCell>
              <p className="font-extralight">{contribution.modComment || '-'}</p>
            </TableCell>
            <TableCell>
              <p className="font-extralight">{getContributionDetails(contribution)}</p>
            </TableCell>
          </TableRow>
        ))}
        </TableBody>
      </Table>
    </section>
  );
}
