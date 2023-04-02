import { Comic, ComicPublishStatus, ComicUploadVerdict } from '~/types/types';
import { queryDb } from '~/utils/database-facade';
import { ApiError, wrapApiError } from '~/utils/request-helpers';

type DbComic = {
  id: number;
  name: string;
  state: 'wip' | 'cancelled' | 'finished';
  publishStatus: ComicPublishStatus;
  classification: 'Furry' | 'Pokemon' | 'MLP' | 'Other';
  category: 'M' | 'F' | 'MF' | 'MM' | 'FF' | 'MF+' | 'I';
  numberOfPages: number;
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
  excludeUnpublishedData: boolean = false
): Promise<{ comic?: Comic; err?: ApiError }> {
  const [comicRes, linksRes, tagsRes] = await Promise.all([
    getDbComicByField(urlBase, 'id', comicId),
    getLinksByComicId(urlBase, comicId),
    getTagsByComicId(urlBase, comicId),
  ]);

  if (comicRes.err) {
    return {
      err: wrapApiError(comicRes.err, `Error getting comic by id: ${comicId}`),
    };
  }
  if (linksRes.err) {
    return {
      err: wrapApiError(linksRes.err, `Error getting comic by id: ${comicId}`),
    };
  }
  if (tagsRes.err) {
    return {
      err: wrapApiError(tagsRes.err, `Error getting comic by id: ${comicId}`),
    };
  }

  const finalComic = mergeDbFieldsToComic(
    comicRes.comic!,
    linksRes.links!,
    tagsRes.tags!,
    excludeUnpublishedData
  );

  return { comic: finalComic };
}

export async function getComicByName(
  urlBase: string,
  comicName: string,
  excludeUnpublishedData: boolean = false
): Promise<{ comic?: Comic; err?: ApiError }> {
  let { comic, err } = await getDbComicByField(urlBase, 'name', comicName);
  if (err) {
    return {
      err: wrapApiError(err, `Error getting comic by name: ${comicName}`),
    };
  }

  const [linksRes, tagsRes] = await Promise.all([
    getLinksByComicId(urlBase, comic!.id),
    getTagsByComicId(urlBase, comic!.id),
  ]);
  if (linksRes.err) {
    return {
      err: wrapApiError(linksRes.err, `Error getting comic by name: ${comicName}`),
    };
  }
  if (tagsRes.err) {
    return {
      err: wrapApiError(tagsRes.err, `Error getting comic by name: ${comicName}`),
    };
  }

  const finalComic = mergeDbFieldsToComic(
    comic!,
    linksRes.links!,
    tagsRes.tags!,
    excludeUnpublishedData
  );

  return { comic: finalComic };
}

function mergeDbFieldsToComic(
  dbComic: DbComic,
  dbLinksRows: DbComicLink[],
  dbTagsRows: DbTag[],
  excludeUnpublishedData: boolean
): Comic {
  const comic: Comic = {
    id: dbComic.id,
    name: dbComic.name,
    state: dbComic.state,
    publishStatus: dbComic.publishStatus,
    classification: dbComic.classification,
    category: dbComic.category,
    numberOfPages: dbComic.numberOfPages,
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

  if (!excludeUnpublishedData) {
    comic.unpublishedData = {
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
): Promise<{ comic?: DbComic; err?: ApiError }> {
  const comicQuery = `SELECT
      comic.id,
      comic.name,
      state,
      publishStatus,
      cat AS classification,
      tag AS category,
      numberOfPages,
      artist.id AS artistId,
      artist.name AS artistName,
      artist.isPending AS artistIsPending,
      unpublishedcomic.timestamp,
      unpublishedcomic.errorText,
      unpublishedcomic.publishDate,
      unpublishedcomic.modId,
      unpublishedcomic.modComment,
      unpublishedcomic.verdict,
      unpublishedcomic.uploadUserId,
      unpublishedcomic.uploadUserIP,
      user.username AS uploadUsername,
      unpublishedcomic.originalNameIfRejected,
      unpublishedcomic.originalArtistIfRejected,
      unpublishedcomic.unlistComment
    FROM comic
    INNER JOIN artist ON (artist.id = comic.artist)
    LEFT JOIN unpublishedcomic ON (unpublishedcomic.comicId = comic.id)
    LEFT JOIN user ON (user.id = unpublishedcomic.uploadUserId)
    WHERE comic.${fieldName} = ?`;

  const comicDbRes = await queryDb<DbComic[]>(urlBase, comicQuery, [fieldValue]);
  if (comicDbRes.errorMessage || !comicDbRes.result) {
    return {
      err: {
        clientMessage: 'Error getting comic',
        logMessage: `Error getting comic by ${fieldName}, value ${fieldValue}`,
        error: comicDbRes,
      },
    };
  }

  return { comic: comicDbRes.result[0] };
}

async function getLinksByComicId(
  urlBase: string,
  comicId: number
): Promise<{ links?: DbComicLink[]; err?: ApiError }> {
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
  if (linksDbRes.errorMessage || !linksDbRes.result) {
    return {
      err: {
        clientMessage: 'Error getting prev/next comic',
        logMessage: `Error getting links for comic ${comicId}`,
        error: linksDbRes,
      },
    };
  }

  return { links: linksDbRes.result };
}

async function getTagsByComicId(
  urlBase: string,
  comicId: number
): Promise<{ tags?: DbTag[]; err?: ApiError }> {
  const tagsQuery = `SELECT
      keyword.id AS tagId,
      keyword.keywordName AS tagName
      FROM comickeyword
      INNER JOIN keyword ON (keyword.id = comickeyword.keywordId)
    WHERE comicId = ?`;

  const tagsDbRes = await queryDb<DbTag[]>(urlBase, tagsQuery, [comicId]);
  if (tagsDbRes.errorMessage || !tagsDbRes.result) {
    return {
      err: {
        clientMessage: 'Error getting tags',
        logMessage: `Error getting tags for comic ${comicId}`,
        error: tagsDbRes,
      },
    };
  }

  return { tags: tagsDbRes.result };
}
