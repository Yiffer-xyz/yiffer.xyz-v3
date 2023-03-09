import { queryDbDirect } from '~/utils/database-facade';
import { ComicProblem, ComicSuggestion, ContributedComic, TagSuggestion } from '.';
import type { ContributionStatus } from '.';
import { CONTRIBUTION_POINTS } from '~/types/contributions';
import { ComicPublishStatus, ComicUploadVerdict } from '~/types/types';

type DbContributedComic = {
  name: string;
  timestamp: string;
  publishStatus: ComicPublishStatus;
  verdict?: ComicUploadVerdict;
  modComment?: string;
  artistName: string;
  numberOfPages: number;
  numberOfKeywords: number;
  originalNameIfRejected?: string;
};

function publishStatusToContributionStatus(
  publishStatus: ComicPublishStatus
): ContributionStatus {
  switch (publishStatus) {
    case 'published':
      return 'approved';
    case 'pending':
      return 'approved';
    case 'uploaded':
      return 'pending';
    case 'rejected':
      return 'rejected';
    case 'rejected-list':
      return 'rejected';
  }
}

export async function getYourContributedComics(
  urlBase: string,
  userId: number
): Promise<ContributedComic[]> {
  const query = `SELECT 
      comic.name,
      timestamp,
      publishStatus,
      verdict,
      modComment,
      artist.name AS artistName,
      numberOfPages,
      COUNT(*) AS numberOfKeywords,
      unpublishedcomic.originalNameIfRejected
    FROM comic 
    INNER JOIN artist ON (artist.Id = comic.Artist)
    INNER JOIN unpublishedcomic ON (unpublishedcomic.comicId = comic.id)
    LEFT JOIN comickeyword ON (comickeyword.comicId = comic.id)
    WHERE unpublishedcomic.uploadUserId = ?
    GROUP BY comic.name, timestamp, publishStatus, verdict, modComment, artistName, numberOfPages`;

  const dbComics = await queryDbDirect<DbContributedComic[]>(urlBase, query, [userId]);

  const comics: ContributedComic[] = dbComics.map(dbComic => {
    const { points, description } = dbComic.verdict
      ? CONTRIBUTION_POINTS.comicUpload[dbComic.verdict]
      : { points: 0, description: undefined };

    let comicName = dbComic.name;
    if (dbComic.publishStatus === 'rejected' && dbComic.originalNameIfRejected) {
      comicName = dbComic.originalNameIfRejected || dbComic.name;
    }

    return {
      comicName: comicName,
      status: publishStatusToContributionStatus(dbComic.publishStatus),
      timestamp: dbComic.timestamp,
      points,
      pointsDescription: description,
      modComment: dbComic.modComment,
      type: 'ContributedComic',
      artistName: dbComic.artistName,
      numberOfPages: dbComic.numberOfPages,
      numberOfKeywords: dbComic.numberOfKeywords,
    };
  });

  return comics;
}

type DbTagSuggestion = {
  comicName: string;
  status: ContributionStatus;
  timestamp: string;
  tagName: string;
  isAdding: boolean;
};

export async function getYourTagSuggestions(
  urlBase: string,
  userId: number
): Promise<TagSuggestion[]> {
  const query = `SELECT 
      comic.Name AS comicName,
      status,
      timestamp,
      keyword.KeywordName AS tagName,
      isAdding
    FROM keywordsuggestion
    INNER JOIN comic ON (comic.Id = keywordsuggestion.ComicId)
    INNER JOIN keyword ON (keyword.Id = keywordsuggestion.KeywordId)
    WHERE userId = ?;
  `;

  const dbTagSuggestions = await queryDbDirect<DbTagSuggestion[]>(urlBase, query, [
    userId,
  ]);

  const tagSuggestions: TagSuggestion[] = dbTagSuggestions.map(dbTagSuggestion => ({
    comicName: dbTagSuggestion.comicName,
    status: dbTagSuggestion.status,
    timestamp: dbTagSuggestion.timestamp,
    suggestion: `${dbTagSuggestion.isAdding ? 'ADD' : 'REMOVE'} ${
      dbTagSuggestion.tagName
    }`,
    points: dbTagSuggestion.status === 'approved' ? 5 : 0,
    pointsDescription: undefined,
    modComment: undefined,
    type: 'TagSuggestion',
  }));

  return tagSuggestions.map(tagSuggestion => ({
    ...tagSuggestion,
    type: 'TagSuggestion',
  })) as TagSuggestion[];
}

type DbComicProblem = {
  comicName: string;
  status: ContributionStatus;
  timestamp: string;
  problemCategory: string;
};

export async function getYourComicProblems(
  urlBase: string,
  userId: number
): Promise<ComicProblem[]> {
  const query = `SELECT
      comic.Name AS comicName,
      Status AS status,
      Timestamp AS timestamp,
      comicproblemcategory.Name AS problemCategory
    FROM comicproblem
    INNER JOIN comic ON (comic.Id = comicproblem.ComicId)
    INNER JOIN comicproblemcategory ON (comicproblemcategory.Id = comicproblem.ProblemCategoryId)
    WHERE UserId = ?;
  `;

  const dbComicProblems = await queryDbDirect<DbComicProblem[]>(urlBase, query, [userId]);

  const comicProblems: ComicProblem[] = dbComicProblems.map(dbComicProblem => ({
    comicName: dbComicProblem.comicName,
    status: dbComicProblem.status,
    timestamp: dbComicProblem.timestamp,
    points: dbComicProblem.status === 'approved' ? 15 : undefined,
    pointsDescription: undefined,
    modComment: undefined,
    type: 'ComicProblem',
    problemCategory: dbComicProblem.problemCategory,
  }));

  return comicProblems;
}

type DbComicSuggestion = {
  comicName: string;
  status: ContributionStatus;
  verdict?: 'good' | 'bad';
  timestamp: string;
  modComment?: string;
};

export async function getYourComicSuggestions(
  urlBase: string,
  userId: number
): Promise<ComicSuggestion[]> {
  const query = `SELECT
      Name AS comicName,
      timestamp,
      status,
      verdict,
      modComment
    FROM comicsuggestion
    WHERE UserId = ?;
  `;

  const dbComicSuggestions = await queryDbDirect<DbComicSuggestion[]>(urlBase, query, [
    userId,
  ]);

  const comicSuggestions: ComicSuggestion[] = dbComicSuggestions.map(
    dbComicSuggestion => ({
      comicName: dbComicSuggestion.comicName,
      status: dbComicSuggestion.status,
      timestamp: dbComicSuggestion.timestamp,
      points: dbComicSuggestion.verdict
        ? CONTRIBUTION_POINTS.comicSuggestion[dbComicSuggestion.verdict].points
        : 0,
      pointsDescription: dbComicSuggestion.verdict
        ? CONTRIBUTION_POINTS.comicSuggestion[dbComicSuggestion.verdict].description
        : undefined,
      modComment: dbComicSuggestion.modComment,
      type: 'ComicSuggestion',
    })
  );

  return comicSuggestions;
}
