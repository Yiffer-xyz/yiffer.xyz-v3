import { Comic, ComicPublishStatus, ComicUploadVerdict } from '~/types/types';
import { queryDbDirect } from '~/utils/database-facade';

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
  unlistComment?: string;
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
): Promise<Comic> {
  const [dbComic, dbLinksRows, dbTagsRows] = await Promise.all([
    getDbComicByField(urlBase, 'id', comicId),
    getLinksByComicId(urlBase, comicId),
    getTagsByComicId(urlBase, comicId),
  ]);

  const finalComic = mergeDbFieldsToComic(
    dbComic,
    dbLinksRows,
    dbTagsRows,
    excludeUnpublishedData
  );
  return finalComic;
}

export async function getComicByName(
  urlBase: string,
  comicName: string,
  excludeUnpublishedData: boolean = false
): Promise<Comic> {
  const dbComic = await getDbComicByField(urlBase, 'name', comicName);

  const [dbLinksRows, dbTagsRows] = await Promise.all([
    getLinksByComicId(urlBase, dbComic.id),
    getTagsByComicId(urlBase, dbComic.id),
  ]);

  return mergeDbFieldsToComic(dbComic, dbLinksRows, dbTagsRows, excludeUnpublishedData);
}

export async function mergeDbFieldsToComic(
  dbComic: DbComic,
  dbLinksRows: DbComicLink[],
  dbTagsRows: DbTag[],
  excludeUnpublishedData: boolean
): Promise<Comic> {
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
      unlistComment: dbComic.unlistComment,
    };
  }

  return comic;
}

async function getDbComicByField(
  urlBase: string,
  fieldName: 'id' | 'name',
  fieldValue: string | number
): Promise<DbComic> {
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
      unpublishedcomic.unlistComment
    FROM comic
    INNER JOIN artist ON (artist.id = comic.artist)
    LEFT JOIN unpublishedcomic ON (unpublishedcomic.comicId = comic.id)
    LEFT JOIN user ON (user.id = unpublishedcomic.uploadUserId)
    WHERE comic.${fieldName} = ?`;

  const comicRows = await queryDbDirect<DbComic[]>(urlBase, comicQuery, [fieldValue]);
  return comicRows[0];
}

async function getLinksByComicId(
  urlBase: string,
  comicId: number
): Promise<DbComicLink[]> {
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
  const linksRows = await queryDbDirect<DbComicLink[]>(urlBase, linksQuery, params);

  return linksRows;
}

async function getTagsByComicId(urlBase: string, comicId: number): Promise<DbTag[]> {
  const tagsQuery = `SELECT
      keyword.id AS tagId,
      keyword.keywordName AS tagName
      FROM comickeyword
      INNER JOIN keyword ON (keyword.id = comickeyword.keywordId)
    WHERE comicId = ?`;

  const tagsRows = await queryDbDirect<DbTag[]>(urlBase, tagsQuery, [comicId]);

  return tagsRows;
}
