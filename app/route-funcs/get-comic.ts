import type { Comic, ComicPublishStatus, ComicUploadVerdict } from '~/types/types';
import { queryDb } from '~/utils/database-facade';
import type {
  ResultOrErrorPromise,
  ResultOrNotFoundOrErrorPromise,
} from '~/utils/request-helpers';
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

export async function getComicByField(
  urlBase: string,
  fieldName: 'id' | 'name',
  fieldValue: string | number,
  excludeMetadata?: boolean
): ResultOrNotFoundOrErrorPromise<Comic> {
  const logCtx = { fieldName, fieldValue, excludeMetadata };
  const [comicRes, linksRes, tagsRes] = await Promise.all([
    getDbComicByField(urlBase, fieldName, fieldValue),
    getLinksByComicField(urlBase, fieldName, fieldValue),
    fieldName === 'id'
      ? getTagsByComicId(urlBase, fieldValue as number)
      : getTagsByComicName(urlBase, fieldValue as string),
  ]);

  if (comicRes.err) {
    return {
      err: wrapApiError(comicRes.err, 'Error getting comic by id/name', logCtx),
    };
  }
  if (linksRes.err) {
    return {
      err: wrapApiError(linksRes.err, 'Error getting comic by id/name', logCtx),
    };
  }
  if (tagsRes.err) {
    return {
      err: wrapApiError(tagsRes.err, 'Error getting comic by id/name', logCtx),
    };
  }

  if (comicRes.notFound) {
    return { notFound: true };
  }

  const finalComic = mergeDbFieldsToComic(
    comicRes.result,
    linksRes.result,
    tagsRes.result,
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
): ResultOrNotFoundOrErrorPromise<DbComic> {
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
  if (comicDbRes.result.length === 0) {
    return { notFound: true };
  }

  return { result: comicDbRes.result[0] };
}

async function getLinksByComicField(
  urlBase: string,
  fieldName: 'id' | 'name',
  fieldValue: string | number
): ResultOrErrorPromise<DbComicLink[]> {
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
  const linksDbRes = await queryDb<DbComicLink[]>(urlBase, linksQuery, params);
  if (linksDbRes.isError || !linksDbRes.result) {
    return makeDbErrObj(linksDbRes, 'Error getting comic links', {
      fieldName,
      fieldValue,
    });
  }
  return { result: linksDbRes.result };
}

async function getTagsByComicId(
  urlBase: string,
  comicId: number
): ResultOrErrorPromise<DbTag[]> {
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
  return { result: tagsDbRes.result };
}

async function getTagsByComicName(
  urlBase: string,
  comicName: string
): ResultOrErrorPromise<DbTag[]> {
  const tagsQuery = `SELECT
      keyword.id AS tagId,
      keyword.keywordName AS tagName
      FROM comickeyword
      INNER JOIN keyword ON (keyword.id = comickeyword.keywordId)
      INNER JOIN comic ON (comic.id = comickeyword.comicId)
    WHERE comic.name = ?`;

  const tagsDbRes = await queryDb<DbTag[]>(urlBase, tagsQuery, [comicName]);
  if (tagsDbRes.isError || !tagsDbRes.result) {
    return makeDbErrObj(tagsDbRes, 'Error getting tags', { comicName });
  }
  return { result: tagsDbRes.result };
}
