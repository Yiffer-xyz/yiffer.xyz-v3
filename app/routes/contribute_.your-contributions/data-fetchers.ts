import { queryDb } from '~/utils/database-facade';
import { CONTRIBUTION_POINTS } from '~/types/contributions';
import type {
  ComicProblem,
  ComicPublishStatus,
  ComicSuggestion,
  ComicUploadVerdict,
  ContributedComic,
  ContributionStatus,
  TagSuggestion,
} from '~/types/types';
import type { ResultOrErrorPromise } from '~/utils/request-helpers';
import { makeDbErrObj } from '~/utils/request-helpers';

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
  originalArtistIfRejected?: string;
};

function publishStatusToContributionStatus(
  publishStatus: ComicPublishStatus
): ContributionStatus {
  switch (publishStatus) {
    case 'uploaded':
      return 'pending';
    case 'rejected':
    case 'rejected-list':
      return 'rejected';
    default:
      return 'approved';
  }
}

export async function getYourContributedComics(
  urlBase: string,
  userId: number
): ResultOrErrorPromise<ContributedComic[]> {
  const query = `SELECT 
      comic.name,
      timestamp,
      publishStatus,
      verdict,
      modComment,
      artist.name AS artistName,
      numberOfPages,
      COUNT(*) AS numberOfKeywords,
      comicmetadata.originalNameIfRejected,
      comicmetadata.originalArtistIfRejected
    FROM comic 
    INNER JOIN artist ON (artist.Id = comic.Artist)
    INNER JOIN comicmetadata ON (comicmetadata.comicId = comic.id)
    LEFT JOIN comickeyword ON (comickeyword.comicId = comic.id)
    WHERE comicmetadata.uploadUserId = ?
    GROUP BY comic.name, timestamp, publishStatus, verdict, modComment, artistName, numberOfPages`;

  const dbComicsRes = await queryDb<DbContributedComic[]>(urlBase, query, [userId]);
  if (dbComicsRes.isError || !dbComicsRes.result) {
    return makeDbErrObj(dbComicsRes, 'Error getting your contributed comics', { userId });
  }

  const comics: ContributedComic[] = dbComicsRes.result.map(dbComic => {
    const { points, description } = dbComic.verdict
      ? CONTRIBUTION_POINTS.comicUpload[dbComic.verdict]
      : { points: 0, description: undefined };

    let comicName = dbComic.name;
    let artistName = dbComic.artistName;
    if (dbComic.publishStatus === 'rejected') {
      if (dbComic.originalNameIfRejected) {
        comicName = dbComic.originalNameIfRejected || dbComic.name;
      }
      if (dbComic.originalArtistIfRejected) {
        artistName = dbComic.originalArtistIfRejected;
      }
    }

    return {
      comicName: comicName,
      artistName: artistName,
      status: publishStatusToContributionStatus(dbComic.publishStatus),
      timestamp: dbComic.timestamp,
      points,
      pointsDescription: description,
      modComment: dbComic.modComment,
      type: 'ContributedComic',
      numberOfPages: dbComic.numberOfPages,
      numberOfKeywords: dbComic.numberOfKeywords,
    };
  });

  return { result: comics };
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
): ResultOrErrorPromise<TagSuggestion[]> {
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

  const dbTagSuggRes = await queryDb<DbTagSuggestion[]>(urlBase, query, [userId]);

  if (dbTagSuggRes.isError || !dbTagSuggRes.result) {
    return makeDbErrObj(dbTagSuggRes, 'Error getting your tag suggestions', { userId });
  }

  const tagSuggestions: TagSuggestion[] = dbTagSuggRes.result.map(dbTagSuggestion => ({
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

  return { result: tagSuggestions };
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
): ResultOrErrorPromise<ComicProblem[]> {
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

  const dbProblemsRes = await queryDb<DbComicProblem[]>(urlBase, query, [userId]);

  if (dbProblemsRes.isError || !dbProblemsRes.result) {
    return makeDbErrObj(dbProblemsRes, 'Error getting your comic problems', { userId });
  }

  const comicProblems: ComicProblem[] = dbProblemsRes.result.map(dbComicProblem => ({
    comicName: dbComicProblem.comicName,
    status: dbComicProblem.status,
    timestamp: dbComicProblem.timestamp,
    points: dbComicProblem.status === 'approved' ? 15 : undefined,
    pointsDescription: undefined,
    modComment: undefined,
    type: 'ComicProblem',
    problemCategory: dbComicProblem.problemCategory,
  }));

  return { result: comicProblems };
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
): ResultOrErrorPromise<ComicSuggestion[]> {
  const query = `SELECT
      Name AS comicName,
      timestamp,
      status,
      verdict,
      modComment
    FROM comicsuggestion
    WHERE UserId = ?;
  `;

  const dbSuggestionsRes = await queryDb<DbComicSuggestion[]>(urlBase, query, [userId]);

  if (dbSuggestionsRes.isError || !dbSuggestionsRes.result) {
    return makeDbErrObj(dbSuggestionsRes, 'Error getting your comic suggestions', {
      userId,
    });
  }

  const comicSuggestions: ComicSuggestion[] = dbSuggestionsRes.result.map(
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

  return { result: comicSuggestions };
}
