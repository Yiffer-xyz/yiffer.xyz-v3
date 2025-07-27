import type { Comic, ComicPublishStatus, ComicUploadVerdict } from '~/types/types';
import {
  mergeCommentsAndVotes,
  type DbComment,
  type DbCommentVote,
} from '~/utils/comment-utils';
import type { QueryWithParams } from '~/utils/database-facade';
import { queryDb, queryDbMultiple } from '~/utils/database-facade';
import { parseDbDateStr } from '~/utils/date-utils';
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
  isBookmarked?: boolean;
  yourStars?: number;
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
  source?: string;
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

type DbPage = {
  token: string;
  pageNumber: number;
  isFullSize: number;
};

type GetComicByFieldParams = {
  db: D1Database;
  fieldName: 'id' | 'name';
  fieldValue: string | number;
  userId?: number;
  includeMetadata?: boolean;
  includePages?: boolean;
  includeDeletedComments?: boolean;
};

export async function getComicByField({
  db,
  fieldName,
  fieldValue,
  userId,
  includeMetadata = false,
  includeDeletedComments = false,
}: GetComicByFieldParams): ResultOrNotFoundOrErrorPromise<Comic> {
  const logCtx = { fieldName, fieldValue, includeMetadata };

  const baseComicDataQuery = getDbComicByFieldQuery(fieldName, fieldValue, userId);
  const baseComicDataRes = await queryDb<DbComic[]>(
    db,
    baseComicDataQuery.query,
    baseComicDataQuery.params,
    baseComicDataQuery.queryName
  );

  if (baseComicDataRes.isError) {
    return makeDbErrObj(baseComicDataRes, 'Error getting comic data', logCtx);
  } else if (
    baseComicDataRes.result.length === 0 ||
    baseComicDataRes.result[0].id === null
  ) {
    return { notFound: true };
  }

  const comicData = baseComicDataRes.result[0];
  const comicId = comicData.id;

  const dbStatements: QueryWithParams[] = [
    getLinksByComicFieldQuery('id', comicId),
    getTagsByComicIdQuery(comicId),
    getCommentsByComicIdQuery(comicId, includeDeletedComments),
    getPagesByComicIdQuery(comicId),
    getCommentVotesByComicIdQuery(comicId),
  ];

  const dbRes = await queryDbMultiple<
    [DbComicLink[], DbTag[], DbComment[], DbPage[], DbCommentVote[]]
  >(db, dbStatements);

  if (dbRes.isError) {
    return makeDbErrObj(dbRes, 'Error getting links+tags+comments+pages+votes', logCtx);
  }

  const [linksRes, tagsRes, commentsRes, pagesRes, commentVotesRes] = dbRes.result;

  const finalComic = mergeDbFieldsToComic(
    comicData,
    linksRes,
    tagsRes,
    commentsRes,
    commentVotesRes,
    pagesRes,
    includeMetadata,
    userId
  );

  return { result: finalComic };
}

function mergeDbFieldsToComic(
  dbComic: DbComic,
  dbLinksRows: DbComicLink[],
  dbTagsRows: DbTag[],
  dbCommentsRows: DbComment[],
  dbCommentVotesRows: DbCommentVote[],
  dbPagesRows: DbPage[],
  includeMetadata: boolean,
  userId?: number
): Comic {
  const userFields = userId
    ? {
        isBookmarked: !!dbComic.isBookmarked,
        yourStars: dbComic.yourStars ?? 0,
      }
    : {};

  const comic: Comic = {
    id: dbComic.id,
    name: dbComic.name,
    state: dbComic.state,
    publishStatus: dbComic.publishStatus,
    category: dbComic.category,
    numberOfPages: dbComic.numberOfPages,
    published: dbComic.published ? parseDbDateStr(dbComic.published) : undefined,
    updated: dbComic.updated ? parseDbDateStr(dbComic.updated) : undefined,
    avgStarsPercent: dbComic.avgStars ? Math.round((dbComic.avgStars - 1) * 50) : 0,
    sumStars: dbComic.sumStars,
    numTimesStarred: dbComic.numTimesStarred,
    ...userFields,
    artist: {
      id: dbComic.artistId,
      name: dbComic.artistName,
      isPending: dbComic.artistIsPending === 1,
    },
    tags: dbTagsRows.map(tag => ({
      id: tag.tagId,
      name: tag.tagName,
    })),
    comments: mergeCommentsAndVotes(dbCommentsRows, dbCommentVotesRows, userId),
    pages: dbPagesRows.map(page => ({
      ...page,
      isFullSize: page.isFullSize === 1,
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

  if (includeMetadata) {
    comic.metadata = {
      timestamp: dbComic.timestamp ? parseDbDateStr(dbComic.timestamp) : new Date(0),
      errorText: dbComic.errorText,
      publishDate: dbComic.publishDate ? parseDbDateStr(dbComic.publishDate) : undefined,
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
      source: dbComic.source,
    };
  }

  return comic;
}

function getDbComicByFieldQuery(
  fieldName: 'id' | 'name',
  fieldValue: string | number,
  userId?: number
): QueryWithParams {
  const isBookmarkedQuery = `
    LEFT JOIN (
      SELECT comicId, 1 as isBookmarked
      FROM comicbookmark
      WHERE userId = ?
    ) AS isBookmarkedQuery ON (comic.id = isBookmarkedQuery.comicId)
  `;

  const userRatingQuery =
    'LEFT JOIN comicrating AS userCR ON comic.id = userCR.comicId AND userCR.userId = ?';

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
      comicmetadata.pendingProblemModId,
      comicmetadata.source
      ${userId ? ', isBookmarkedQuery.isBookmarked AS isBookmarked' : ''}
      ${userId ? ', userCR.rating AS yourStars' : ''}
    FROM comic
    INNER JOIN artist ON (artist.id = comic.artist)
    LEFT JOIN comicmetadata ON (comicmetadata.comicId = comic.id)
    LEFT JOIN user ON (user.id = comicmetadata.uploadUserId)
    LEFT JOIN comicrating ON (comic.id = comicrating.comicId)
    ${userId ? isBookmarkedQuery : ''}
    ${userId ? userRatingQuery : ''}
    WHERE comic.${fieldName} = ?
    LIMIT 1`;

  return {
    query: comicQuery,
    params: userId ? [userId, userId, fieldValue] : [fieldValue],
    queryName: 'Comic by field, multi',
  };
}

function getLinksByComicFieldQuery(
  fieldName: 'id' | 'name',
  fieldValue: string | number
): QueryWithParams {
  const linksQuery = `
    SELECT
      comiclink.firstComic AS firstComicId,
      comiclink.lastComic AS lastComicId,
      comic1.name AS firstComicName,
      comic2.name AS lastComicName
    FROM comiclink
    INNER JOIN comic AS comic1 ON comiclink.firstComic = comic1.id
    INNER JOIN comic AS comic2 ON comiclink.lastComic = comic2.id
    WHERE comic1.${fieldName} = ?

    UNION ALL

    SELECT
      comiclink.firstComic AS firstComicId,
      comiclink.lastComic AS lastComicId,
      comic1.name AS firstComicName,
      comic2.name AS lastComicName
    FROM comiclink
    INNER JOIN comic AS comic1 ON comiclink.firstComic = comic1.id
    INNER JOIN comic AS comic2 ON comiclink.lastComic = comic2.id
    WHERE comic2.${fieldName} = ?`;

  const params = [fieldValue, fieldValue];

  return {
    query: linksQuery,
    params,
    queryName: 'Comic links, multi',
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
    queryName: 'Comic tags by comic ID',
  };
}

function getCommentsByComicIdQuery(
  comicId: number,
  includeDeletedComments: boolean
): QueryWithParams {
  const commentsQuery = `SELECT
      comiccomment.id AS id,
      comiccomment.comicId AS comicId,
      comiccomment.userId AS userId,
      comiccomment.comment AS comment,
      comiccomment.timestamp AS timestamp,
      comiccomment.isHidden AS isHidden,
      user.username AS username,
      user.profilePictureToken AS profilePictureToken
    FROM comiccomment
    INNER JOIN user ON (user.id = comiccomment.userId)
    WHERE comicId = ? ${includeDeletedComments ? '' : 'AND comiccomment.isHidden = 0'}`;

  return {
    query: commentsQuery,
    params: [comicId],
    queryName: 'Comic comments by comic ID',
  };
}

function getCommentVotesByComicIdQuery(comicId: number): QueryWithParams {
  const commentVotesQuery = `SELECT
      comiccommentvote.id AS id,
      comiccommentvote.userId AS userId,
      comiccommentvote.commentId AS commentId,
      comiccommentvote.isUpvote AS isUpvote
    FROM comiccommentvote
    WHERE comiccommentvote.comicId = ?`;

  return {
    query: commentVotesQuery,
    params: [comicId],
    queryName: 'Comic comment votes by comic ID',
  };
}

function getPagesByComicIdQuery(comicId: number): QueryWithParams {
  const pagesQuery = `SELECT
      comicpage.token AS token,
      comicpage.pageNumber AS pageNumber,
      comicpage.isFullSize AS isFullSize
    FROM comicpage
    WHERE comicpage.comicId = ?
    ORDER BY comicpage.pageNumber ASC`;

  return {
    query: pagesQuery,
    params: [comicId],
    queryName: 'Comic pages by comic ID',
  };
}
