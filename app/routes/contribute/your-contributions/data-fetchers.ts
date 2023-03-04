import { queryDbDirect } from '~/utils/database-facade';
import { capitalizeString } from '~/utils/general';
import {
  ComicProblem,
  ComicStatus,
  ComicSuggestion,
  ContributedComic,
  TagSuggestion,
} from '.';

export async function getYourContributedComics(
  urlBase: string,
  userId: number
): Promise<ContributedComic[]> {
  const query = `SELECT 
      ComicName AS comicName,
      status,
      timestamp,
      points,
      PointsDescription AS pointsDescription,
      ModComment AS modComment,
      ArtistId AS artistId,
      COALESCE(NewArtistName, artist.Name) AS artistName,
      NumberOfPages AS numberOfPages,
      COUNT(*) AS numberOfKeywords
    FROM comicupload 
    LEFT JOIN artist ON (artist.Id = comicupload.ArtistId)
    LEFT JOIN comicuploadkeyword ON (comicuploadkeyword.ComicUploadId = comicupload.Id)
    WHERE UserId = ?
    GROUP BY comicName, status, timestamp, points, pointsDescription, modComment, artistId, artistName, numberOfPages;`;

  const comics = await queryDbDirect<ContributedComic[]>(urlBase, query, [userId]);

  return comics.map(comic => ({
    ...comic,
    type: 'ContributedComic',
    numberOfKeywords: comic.numberOfKeywords === 1 ? 0 : comic.numberOfKeywords, // DB group by thing
  })) as ContributedComic[];
}

type DbTagSuggestion = {
  comicName: string;
  isProcessed: boolean;
  isApproved: boolean;
  timestamp: string;
  tagName: string;
  isAdding: boolean;
};

function getTagSuggestionStatus(dbTagSuggestion: DbTagSuggestion): ComicStatus {
  if (dbTagSuggestion.isApproved) {
    return ComicStatus.APPROVED;
  } else if (dbTagSuggestion.isProcessed) {
    return ComicStatus.REJECTED;
  } else {
    return ComicStatus.PENDING;
  }
}

export async function getYourTagSuggestions(
  urlBase: string,
  userId: number
): Promise<TagSuggestion[]> {
  const query = `SELECT 
      comic.Name AS comicName,
      Processed AS isProcessed,
      Approved as isApproved,
      Timestamp AS timestamp,
      keyword.KeywordName AS tagName,
      IsAdding AS isAdding
    FROM keywordsuggestion
    INNER JOIN comic ON (comic.Id = keywordsuggestion.ComicId)
    INNER JOIN keyword ON (keyword.Id = keywordsuggestion.KeywordId)
    WHERE User = ?;
  `;

  const dbTagSuggestions = await queryDbDirect<DbTagSuggestion[]>(urlBase, query, [
    userId,
  ]);

  const tagSuggestions: TagSuggestion[] = dbTagSuggestions.map(dbTagSuggestion => ({
    comicName: dbTagSuggestion.comicName,
    status: getTagSuggestionStatus(dbTagSuggestion),
    timestamp: dbTagSuggestion.timestamp,
    suggestion: `${dbTagSuggestion.isAdding ? 'ADD' : 'REMOVE'} ${
      dbTagSuggestion.tagName
    }`,
    points: dbTagSuggestion.isApproved ? 5 : dbTagSuggestion.isProcessed ? 0 : null,
    pointsDescription: null,
    modComment: null,
    type: 'TagSuggestion',
  }));

  return tagSuggestions.map(tagSuggestion => ({
    ...tagSuggestion,
    type: 'TagSuggestion',
  })) as TagSuggestion[];
}

type DbComicProblem = {
  comicName: string;
  status: ComicStatus;
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
    points: dbComicProblem.status === ComicStatus.APPROVED ? 15 : null,
    pointsDescription: null,
    modComment: null,
    type: 'ComicProblem',
    problemCategory: dbComicProblem.problemCategory,
  }));

  return comicProblems;
}

export async function getYourComicSuggestions(
  urlBase: string,
  userId: number
): Promise<ComicSuggestion[]> {
  const query = `SELECT
      Name AS comicName,
      Status AS status,
      Timestamp AS timestamp,
      Points AS points,
      ModComment AS pointsDescription,
      'ComicSuggestion' AS type
    FROM comicsuggestion
    WHERE UserId = ?;
  `;

  const comicSuggestions = await queryDbDirect<ComicSuggestion[]>(urlBase, query, [
    userId,
  ]);
  return comicSuggestions;
}
