import type { Comic, ComicPublishStatus, ComicUploadVerdict } from '~/types/types';
import type { QueryWithParams } from '~/utils/database-facade';
import { queryDbMultiple } from '~/utils/database-facade';
import type { ResultOrNotFoundOrErrorPromise } from '~/utils/request-helpers';
import { makeDbErrObj } from '~/utils/request-helpers';

type DbComic = {
  id: number;
  name: string;
  state: 'wip' | 'cancelled' | 'finished';
  publishStatus: ComicPublishStatus;
  category: 'M' | 'F' | 'MF' | 'MM' | 'FF' | 'MF+' | 'I';
  numberOfPages: number;
  published?: string;
  updated?: string;
  avgStars: number;
  sumStars: number;
  numTimesStarred: number;
  artistId: number;
  artistName: string;
  artistIsPending: 0 | 1;
  timestamp: string;
  errorText?: string;
  publishDate?: string;
  modId?: number;
  modComment?: string;
  verdict?: ComicUploadVerdict;
  uploadUserId?: number;
  uploadUserIP?: string;
  uploadUsername?: string;
  originalNameIfRejected?: string;
  originalArtistIfRejected?: string;
  unlistComment?: string;
  pendingProblemModId?: number;
};

type DbComicLink = {
  firstComicId: number;
  lastComicId: number;
  firstComicName: string;
  lastComicName: string;
};

type DbTag = {
  tagId: number;
  tagName: string;
};

export async function getComicByField(
  db: D1Database,
  fieldName: 'id' | 'name',
  fieldValue: string | number,
  excludeMetadata?: boolean
): ResultOrNotFoundOrErrorPromise<Comic> {
  const logCtx = { fieldName, fieldValue, excludeMetadata };
  const dbStatements: QueryWithParams[] = [
    getDbComicByFieldQuery(fieldName, fieldValue),
    getLinksByComicFieldQuery(fieldName, fieldValue),
    fieldName === 'id'
      ? getTagsByComicIdQuery(fieldValue as number)
      : getTagsByComicNameQuery(fieldValue as string),
  ];

  const dbRes = await queryDbMultiple<[DbComic[], DbComicLink[], DbTag[]]>(
    db,
    dbStatements
  );

  if (dbRes.isError) {
    return makeDbErrObj(dbRes, 'Error getting comic+links+tags', logCtx);
  }

  const [comicRes, linksRes, tagsRes] = dbRes.result;
  if (comicRes.length === 0) {
    return { notFound: true };
  }

  const finalComic = mergeDbFieldsToComic(
    comicRes[0],
    linksRes,
    tagsRes,
    !!excludeMetadata
  );

  return { result: finalComic };
}

function mergeDbFieldsToComic(
  dbComic: DbComic,
  dbLinksRows: DbComicLink[],
  dbTagsRows: DbTag[],
  excludeMetadata: boolean
): Comic {
  const comic: Comic = {
    id: dbComic.id,
    name: dbComic.name,
    state: dbComic.state,
    publishStatus: dbComic.publishStatus,
    category: dbComic.category,
    numberOfPages: dbComic.numberOfPages,
    published: dbComic.published,
    updated: dbComic.updated,
    avgStarsPercent: dbComic.avgStars ? Math.round((dbComic.avgStars - 1) * 50) : 0,
    sumStars: dbComic.sumStars,
    numTimesStarred: dbComic.numTimesStarred,
    artist: {
      id: dbComic.artistId,
      name: dbComic.artistName,
      isPending: dbComic.artistIsPending === 1,
    },
    tags: dbTagsRows.map(tag => ({
      id: tag.tagId,
      name: tag.tagName,
    })),
  };

  if (dbLinksRows.length > 0) {
    for (const link of dbLinksRows) {
      if (link.firstComicId === dbComic.id) {
        comic.nextComic = {
          id: link.lastComicId,
          name: link.lastComicName,
        };
      } else if (link.lastComicId === dbComic.id) {
        comic.previousComic = {
          id: link.firstComicId,
          name: link.firstComicName,
        };
      }
    }
  }

  if (!excludeMetadata) {
    comic.metadata = {
      timestamp: dbComic.timestamp,
      errorText: dbComic.errorText,
      publishDate: dbComic.publishDate,
      modId: dbComic.modId,
      modComment: dbComic.modComment,
      verdict: dbComic.verdict,
      uploadUserId: dbComic.uploadUserId,
      uploadUserIP: dbComic.uploadUserIP,
      uploadUsername: dbComic.uploadUsername,
      originalNameIfRejected: dbComic.originalNameIfRejected,
      originalArtistIfRejected: dbComic.originalArtistIfRejected,
      unlistComment: dbComic.unlistComment,
      pendingProblemModId: dbComic.pendingProblemModId,
    };
  }

  return comic;
}

function getDbComicByFieldQuery(
  fieldName: 'id' | 'name',
  fieldValue: string | number
): QueryWithParams {
  const comicQuery = `SELECT
      comic.id,
      comic.name,
      state,
      publishStatus,
      category,
      numberOfPages,
      published,
      updated,
      AVG(comicrating.rating) AS avgStars,
      SUM(comicrating.rating) AS sumStars,
      COUNT(comicrating.rating) AS numTimesStarred,
      artist.id AS artistId,
      artist.name AS artistName,
      artist.isPending AS artistIsPending,
      comicmetadata.timestamp,
      comicmetadata.errorText,
      comicmetadata.publishDate,
      comicmetadata.modId,
      comicmetadata.modComment,
      comicmetadata.verdict,
      comicmetadata.uploadUserId,
      comicmetadata.uploadUserIP,
      user.username AS uploadUsername,
      comicmetadata.originalNameIfRejected,
      comicmetadata.originalArtistIfRejected,
      comicmetadata.unlistComment,
      comicmetadata.pendingProblemModId
    FROM comic
    INNER JOIN artist ON (artist.id = comic.artist)
    LEFT JOIN comicmetadata ON (comicmetadata.comicId = comic.id)
    LEFT JOIN user ON (user.id = comicmetadata.uploadUserId)
    LEFT JOIN comicrating ON (comic.id = comicrating.comicId)
    WHERE comic.${fieldName} = ?
    LIMIT 1`;

  return {
    query: comicQuery,
    params: [fieldValue],
  };
}

function getLinksByComicFieldQuery(
  fieldName: 'id' | 'name',
  fieldValue: string | number
): QueryWithParams {
  const linksQuery = `SELECT
    Q1.*, comic.name AS lastComicName
    FROM (
      SELECT 
        firstComic AS firstComicId,
        lastComic AS lastComicId,
        comic.name AS firstComicName
      FROM comiclink
      INNER JOIN comic ON (firstComic = comic.id) 
    ) AS Q1
    INNER JOIN comic ON (lastComicId = comic.id)
    WHERE 
      ${fieldName === 'id' ? 'firstComicId' : 'firstComicName'} = ?
      OR ${fieldName === 'id' ? 'lastComicId' : 'comic.name'} = ?`;

  const params = [fieldValue, fieldValue];

  return {
    query: linksQuery,
    params,
  };
}

function getTagsByComicIdQuery(comicId: number): QueryWithParams {
  const tagsQuery = `SELECT
      keyword.id AS tagId,
      keyword.keywordName AS tagName
      FROM comickeyword
      INNER JOIN keyword ON (keyword.id = comickeyword.keywordId)
    WHERE comicId = ?`;

  return {
    query: tagsQuery,
    params: [comicId],
  };
}

function getTagsByComicNameQuery(comicName: string): QueryWithParams {
  const tagsQuery = `SELECT
      keyword.id AS tagId,
      keyword.keywordName AS tagName
      FROM comickeyword
      INNER JOIN keyword ON (keyword.id = comickeyword.keywordId)
      INNER JOIN comic ON (comic.id = comickeyword.comicId)
    WHERE comic.name = ?`;

  return {
    query: tagsQuery,
    params: [comicName],
  };
}
