import { CONTRIBUTION_POINTS } from '~/types/contributions';
import type {
  ComicProblem,
  ComicPublishStatus,
  ComicSuggestion,
  ComicUploadVerdict,
  ContributedComic,
  ContributionStatus,
  ContributionTagSuggestion,
  TagSuggestionContributionItem,
} from '~/types/types';
import { parseDbDateStr } from '~/utils/date-utils';

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
      timestamp: parseDbDateStr(dbComic.timestamp),
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

function numberOrNullToBoolean(value: number | null): boolean | null {
  return value === 1 ? true : value === 0 ? false : null;
}

export type DbTagSuggestion = {
  tagSuggestionGroupId: number;
  comicName: string;
  isProcessed: number;
  timestamp: string;
  tagName: string;
  isAdding: boolean;
  isApproved: number | null;
};

export function mapDBTagSuggestions(
  suggestions: DbTagSuggestion[]
): ContributionTagSuggestion[] {
  // first, group together all suggestions of the same tagSuggestionGroupId:
  const groupedSuggestions: Record<number, DbTagSuggestion[]> = {};
  suggestions.forEach(dbTagSuggestion => {
    if (!groupedSuggestions[dbTagSuggestion.tagSuggestionGroupId]) {
      groupedSuggestions[dbTagSuggestion.tagSuggestionGroupId] = [];
    }
    groupedSuggestions[dbTagSuggestion.tagSuggestionGroupId].push(dbTagSuggestion);
  });

  const mappedSuggestions: ContributionTagSuggestion[] = [];
  Object.values(groupedSuggestions).forEach(group => {
    const isProcessed = group[0].isProcessed === 1;
    const tags: TagSuggestionContributionItem[] = group.map(dbTagSuggestion => ({
      tagName: dbTagSuggestion.tagName,
      isAdding: !!dbTagSuggestion.isAdding,
      isApproved: numberOrNullToBoolean(dbTagSuggestion.isApproved),
    }));

    mappedSuggestions.push({
      comicName: group[0].comicName,
      status: isProcessed ? 'processed' : 'pending',
      timestamp: parseDbDateStr(group[0].timestamp),
      points:
        tags.filter(t => t.isApproved).length * CONTRIBUTION_POINTS.tagSuggestion.points,
      type: 'TagSuggestion',
      addTags: tags.filter(tag => tag.isAdding),
      removeTags: tags.filter(tag => !tag.isAdding),
    });
  });

  return mappedSuggestions;
}

export type DbComicProblem = {
  comicName: string;
  status: ContributionStatus;
  timestamp: string;
  problemCategory: string;
  description: string;
};

export function mapDBComicProblems(problems: DbComicProblem[]): ComicProblem[] {
  return problems.map(dbComicProblem => ({
    comicName: dbComicProblem.comicName,
    status: dbComicProblem.status,
    timestamp: parseDbDateStr(dbComicProblem.timestamp),
    points:
      dbComicProblem.status === 'approved'
        ? CONTRIBUTION_POINTS.comicProblem.points
        : undefined,
    pointsDescription: undefined,
    modComment: undefined,
    type: 'ComicProblem',
    problemCategory: dbComicProblem.problemCategory,
    description: dbComicProblem.description,
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
    timestamp: parseDbDateStr(dbComicSuggestion.timestamp),
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
    tagsuggestiongroup.id AS tagSuggestionGroupId,
    tagsuggestiongroup.isProcessed AS isProcessed,
    tagsuggestiongroup.timestamp AS timestamp,
    keyword.KeywordName AS tagName,
    tagsuggestionitem.isAdding AS isAdding,
    tagsuggestionitem.isApproved AS isApproved
  FROM tagsuggestiongroup
  LEFT JOIN tagsuggestionitem ON (tagsuggestiongroup.id = tagsuggestionitem.tagSuggestionGroupId)
  INNER JOIN keyword ON (keyword.id = tagsuggestionitem.keywordId)
  INNER JOIN comic ON (comic.id = tagsuggestiongroup.comicId)
  WHERE userId = ?;
`;

export const yourComicProblemsQuery = `SELECT
    comic.Name AS comicName,
    Status AS status,
    Timestamp AS timestamp,
    problemCategory,
    description
  FROM comicproblem
  INNER JOIN comic ON (comic.Id = comicproblem.ComicId)
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
