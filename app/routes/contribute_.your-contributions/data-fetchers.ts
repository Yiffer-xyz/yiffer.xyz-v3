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

export type DbContributedComic = {
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

export function mapDbContributedComics(comics: DbContributedComic[]): ContributedComic[] {
  const mappedComics: ContributedComic[] = comics.map(dbComic => {
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

  return mappedComics;
}

export type DbTagSuggestion = {
  comicName: string;
  status: ContributionStatus;
  timestamp: string;
  tagName: string;
  isAdding: boolean;
};

export function mapDBTagSuggestions(suggestions: DbTagSuggestion[]): TagSuggestion[] {
  return suggestions.map(dbTagSuggestion => ({
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
}

export type DbComicProblem = {
  comicName: string;
  status: ContributionStatus;
  timestamp: string;
  problemCategory: string;
};

export function mapDBComicProblems(problems: DbComicProblem[]): ComicProblem[] {
  return problems.map(dbComicProblem => ({
    comicName: dbComicProblem.comicName,
    status: dbComicProblem.status,
    timestamp: dbComicProblem.timestamp,
    points: dbComicProblem.status === 'approved' ? 15 : undefined,
    pointsDescription: undefined,
    modComment: undefined,
    type: 'ComicProblem',
    problemCategory: dbComicProblem.problemCategory,
  }));
}

export type DbComicSuggestion = {
  comicName: string;
  status: ContributionStatus;
  verdict?: 'good' | 'bad';
  timestamp: string;
  modComment?: string;
};

export function mapDbComicSuggestions(
  suggestions: DbComicSuggestion[]
): ComicSuggestion[] {
  return suggestions.map(dbComicSuggestion => ({
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
  }));
}

export const yourContributedComicsQuery = `SELECT 
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

export const yourTagSuggestionsQuery = `SELECT 
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

export const yourComicProblemsQuery = `SELECT
    comic.Name AS comicName,
    Status AS status,
    Timestamp AS timestamp,
    comicproblemcategory.Name AS problemCategory
  FROM comicproblem
  INNER JOIN comic ON (comic.Id = comicproblem.ComicId)
  INNER JOIN comicproblemcategory ON (comicproblemcategory.Id = comicproblem.ProblemCategoryId)
  WHERE UserId = ?;
`;

export const yourComicSuggestionsQuery = `SELECT
    Name AS comicName,
    timestamp,
    status,
    verdict,
    modComment
  FROM comicsuggestion
  WHERE UserId = ?;
`;
