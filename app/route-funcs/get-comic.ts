import type { Comic, ComicPublishStatus, ComicUploadVerdict } from '~/types/types';
import { queryDb } from '~/utils/database-facade';
import type { ApiError } from '~/utils/request-helpers';
import { makeDbErrObj, wrapApiError } from '~/utils/request-helpers';

type DbComic = {
  id: number;
  name: string;
  state: 'wip' | 'cancelled' | 'finished';
  publishStatus: ComicPublishStatus;
  classification: 'Furry' | 'Pokemon' | 'MLP' | 'Other';
  category: 'M' | 'F' | 'MF' | 'MM' | 'FF' | 'MF+' | 'I';
  numberOfPages: number;
  published?: string;
  updated?: string;
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

export async function getComicById(
  urlBase: string,
  comicId: number,
  excludeMetadata?: boolean
): Promise<{ comic?: Comic; err?: ApiError }> {
  const logCtx = { comicId, excludeMetadata };
  const [comicRes, linksRes, tagsRes] = await Promise.all([
    getDbComicByField(urlBase, 'id', comicId),
    getLinksByComicId(urlBase, comicId),
    getTagsByComicId(urlBase, comicId),
  ]);

  if (comicRes.err) {
    return {
      err: wrapApiError(comicRes.err, 'Error getting comic by id', logCtx),
    };
  }
  if (linksRes.err) {
    return {
      err: wrapApiError(linksRes.err, 'Error getting comic by id', logCtx),
    };
  }
  if (tagsRes.err) {
    return {
      err: wrapApiError(tagsRes.err, 'Error getting comic by id', logCtx),
    };
  }

  if (!comicRes.comic) {
    return {
      err: {
        logMessage: 'ComicRes.comic has no value',
        context: logCtx,
      },
    };
  }

  const finalComic = mergeDbFieldsToComic(
    comicRes.comic,
    linksRes.links,
    tagsRes.tags,
    !!excludeMetadata
  );

  return { comic: finalComic };
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
    classification: dbComic.classification,
    category: dbComic.category,
    numberOfPages: dbComic.numberOfPages,
    published: dbComic.published,
    updated: dbComic.updated,
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

async function getDbComicByField(
  urlBase: string,
  fieldName: 'id' | 'name',
  fieldValue: string | number
): Promise<{ comic: DbComic; err?: undefined } | { err: ApiError }> {
  const comicQuery = `SELECT
      comic.id,
      comic.name,
      state,
      publishStatus,
      cat AS classification,
      tag AS category,
      numberOfPages,
      published,
      updated,
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
    WHERE comic.${fieldName} = ?`;

  const comicDbRes = await queryDb<DbComic[]>(urlBase, comicQuery, [fieldValue]);
  if (comicDbRes.isError || !comicDbRes.result) {
    return makeDbErrObj(comicDbRes, 'Error getting comic', { fieldName, fieldValue });
  }
  return { comic: comicDbRes.result[0] };
}

async function getLinksByComicId(
  urlBase: string,
  comicId: number
): Promise<{ links: DbComicLink[]; err?: undefined } | { err: ApiError }> {
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
    WHERE firstComicId = ? OR lastComicId = ?`;

  const params = [comicId, comicId];
  const linksDbRes = await queryDb<DbComicLink[]>(urlBase, linksQuery, params);
  if (linksDbRes.isError || !linksDbRes.result) {
    return makeDbErrObj(linksDbRes, 'Error getting comic links', { comicId });
  }
  return { links: linksDbRes.result };
}

async function getTagsByComicId(
  urlBase: string,
  comicId: number
): Promise<{ tags: DbTag[]; err?: undefined } | { err: ApiError }> {
  const tagsQuery = `SELECT
      keyword.id AS tagId,
      keyword.keywordName AS tagName
      FROM comickeyword
      INNER JOIN keyword ON (keyword.id = comickeyword.keywordId)
    WHERE comicId = ?`;

  const tagsDbRes = await queryDb<DbTag[]>(urlBase, tagsQuery, [comicId]);
  if (tagsDbRes.isError || !tagsDbRes.result) {
    return makeDbErrObj(tagsDbRes, 'Error getting tags', { comicId });
  }
  return { tags: tagsDbRes.result };
}
