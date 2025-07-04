import { addContributionPoints } from '~/route-funcs/add-contribution-points';
import { type UserSession } from '~/types/types';
import { queryDb, queryDbExec } from '~/utils/database-facade';
import type { ApiError, ResultOrErrorPromise } from '~/utils/request-helpers';
import { makeDbErr, makeDbErrObj, wrapApiError } from '~/utils/request-helpers';
import type { NewArtist, UploadBody } from './route';
import { addModLogAndPoints } from '~/route-funcs/add-mod-log-and-points';
import { generateToken } from '~/utils/string-utils';
import { batchRenameR2Files } from '~/utils/r2Utils';
import { R2_COMICS_FOLDER, R2_TEMP_FOLDER } from '~/types/constants';

async function rollBackComicAndArtist(
  db: D1Database,
  comicId?: number,
  artistId?: number
) {
  if (comicId) {
    await queryDbExec(db, 'DELETE FROM comic WHERE id = ?', [comicId]);
  }
  if (artistId) {
    await queryDbExec(db, 'DELETE FROM artist WHERE id = ?', [artistId]);
  }
}

export async function processUpload(
  db: D1Database,
  r2Bucket: R2Bucket,
  isLocalDev: boolean,
  imagesServerUrl: string,
  uploadBody: UploadBody,
  user: UserSession | null,
  userIP?: string
): Promise<ApiError | undefined> {
  const isMod = !!user && ['moderator', 'admin'].includes(user?.userType);
  const skipApproval = isMod;
  let newArtistId: number | undefined;

  if (uploadBody.newArtist) {
    const createRes = await createArtist(db, uploadBody.newArtist, skipApproval);
    if (createRes.err)
      return wrapApiError(createRes.err, 'Error uploading', { uploadBody });
    uploadBody.artistId = createRes.result.artistId;
    newArtistId = createRes.result.artistId;
  }

  const dbRes = await createComic(db, uploadBody, skipApproval);
  if (dbRes.err) {
    await rollBackComicAndArtist(db, undefined, newArtistId);
    return wrapApiError(dbRes.err, 'Error uploading', { uploadBody });
  }
  const comicId = dbRes.result;

  if (!uploadBody.pages || uploadBody.pages.length === 0) {
    await rollBackComicAndArtist(db, comicId, newArtistId);
    return { logMessage: 'No pages' };
  }

  const updatedPages: { pageNumber: number; finalToken: string }[] = [];
  const oldKeys: string[] = [];
  const newKeys: string[] = [];

  try {
    for (const page of uploadBody.pages) {
      if (page.pageNumber === 0) {
        for (const fileType of ['jpg', 'webp']) {
          for (const size of [2, 3]) {
            const oldKey = `${R2_TEMP_FOLDER}/${page.tempToken}-${size}x.${fileType}`;
            const newKey = `${R2_COMICS_FOLDER}/${comicId}/thumbnail-${size}x.${fileType}`;
            newKeys.push(newKey);
            oldKeys.push(oldKey);
          }
        }
      } else {
        const newToken = generateToken();
        const oldKey = `${R2_TEMP_FOLDER}/${page.tempToken}.jpg`;
        const newKey = `${R2_COMICS_FOLDER}/${comicId}/${newToken}.jpg`;
        newKeys.push(newKey);
        oldKeys.push(oldKey);

        updatedPages.push({
          pageNumber: page.pageNumber,
          finalToken: newToken,
        });
      }
    }

    await batchRenameR2Files({
      r2: r2Bucket,
      oldKeys,
      newKeys,
      isLocalDev,
      imagesServerUrl,
    });
  } catch (err: any) {
    await rollBackComicAndArtist(db, comicId, newArtistId);
    return {
      logMessage: 'Error renaming files: ' + err.message,
    };
  }

  let insertPagesQuery = `INSERT INTO comicpage (token, comicId, pageNumber) VALUES `;
  const insertPagesParams: any[] = [];

  for (let i = 0; i < updatedPages.length; i++) {
    if (updatedPages[i].pageNumber === 0) continue;
    const page = updatedPages[i];
    insertPagesQuery += `(?, ?, ?)`;
    insertPagesParams.push(page.finalToken, comicId, page.pageNumber);
    if (i < updatedPages.length - 1) {
      insertPagesQuery += ', ';
    }
  }

  const insertPagesDbRes = await queryDbExec(
    db,
    insertPagesQuery,
    insertPagesParams,
    'Comic page creation'
  );
  if (insertPagesDbRes.isError) {
    await rollBackComicAndArtist(db, comicId, newArtistId);
    return makeDbErr(insertPagesDbRes, 'Error creating comic pages');
  }

  const err = await createComicMetadata(
    db,
    comicId,
    uploadBody,
    skipApproval,
    user?.userId,
    userIP
  );
  if (err) {
    await rollBackComicAndArtist(db, comicId, newArtistId);
    return wrapApiError(err, 'Error uploading', { uploadBody });
  }

  if (uploadBody.previousComic || uploadBody.nextComic) {
    const err = await createComicLinks(db, uploadBody, comicId);
    if (err) {
      await rollBackComicAndArtist(db, comicId, newArtistId);
      return wrapApiError(err, 'Error uploading', { uploadBody });
    }
  }

  if (uploadBody.tagIds && uploadBody.tagIds.length > 0) {
    const err = await createComicTags(db, uploadBody.tagIds, comicId);
    if (err) {
      await rollBackComicAndArtist(db, comicId, newArtistId);
      return wrapApiError(err, 'Error uploading', { uploadBody });
    }
  }

  if (isMod) {
    const modLogErr = await addModLogAndPoints({
      db,
      userId: user?.userId,
      comicId: comicId,
      actionType: 'comic-uploaded',
    });
    if (modLogErr) {
      return wrapApiError(modLogErr, 'Error uploading', { uploadBody });
    }
  }
}

async function createComicTags(
  db: D1Database,
  tagIds: number[],
  comicId: number
): Promise<ApiError | undefined> {
  let query = `
    INSERT INTO comickeyword
    (comicId, keywordId)
    VALUES 
  `;
  const params: number[] = [];

  tagIds.forEach((tagId, index) => {
    query += `(?, ?)`;
    params.push(comicId, tagId);
    if (index < tagIds.length - 1) {
      query += ', ';
    }
  });

  const dbRes = await queryDbExec(db, query, params, 'Tag added to comic');
  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error creating comic tags');
  }
}

async function createComicLinks(
  db: D1Database,
  uploadBody: UploadBody,
  comicId: number
): Promise<ApiError | undefined> {
  let query = `
    INSERT INTO comiclink
    (firstComic, lastComic)
    VALUES (?, ?)
  `;
  const queryParams: any[] = [];

  if (uploadBody.previousComic) {
    queryParams.push(uploadBody.previousComic.id, comicId);
  }
  if (uploadBody.nextComic) {
    queryParams.push(comicId, uploadBody.nextComic.id);
  }
  if (uploadBody.previousComic && uploadBody.nextComic) {
    query += ', (?, ?)';
  }

  const dbRes = await queryDbExec(db, query, queryParams, 'Comic links creation');
  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error creating comic links');
  }
}

async function createComicMetadata(
  db: D1Database,
  comicId: number,
  uploadBody: UploadBody,
  skipApproval: boolean,
  userId?: number,
  userIP?: string
): Promise<ApiError | undefined> {
  const query = `
    INSERT INTO comicmetadata
    (comicId, uploadUserId, uploadUserIP, uploadId, verdict, source)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const values = [
    comicId,
    userId || null,
    userIP || null,
    uploadBody.uploadId,
    skipApproval ? 'excellent' : null,
    uploadBody.source,
  ];

  const dbRes = await queryDbExec(db, query, values, 'Comic metadata creation');
  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error creating comic metadata');
  }

  if (skipApproval) {
    const err = await addContributionPoints(db, userId ?? null, `comicUploadexcellent`);
    if (err) {
      return wrapApiError(err, 'Error adding contribution points for direct mod upload');
    }
  }
}

async function createComic(
  db: D1Database,
  uploadBody: UploadBody,
  skipApproval: boolean
): ResultOrErrorPromise<number> {
  const query = `
    INSERT INTO comic
    (name, category, state, numberOfPages, artist, publishStatus)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const values = [
    uploadBody.comicName.trim(),
    uploadBody.category,
    uploadBody.state,
    uploadBody.numberOfPages,
    uploadBody.artistId,
    skipApproval ? 'pending' : 'uploaded',
  ];

  const result = await queryDbExec(db, query, values, 'Comic creation');
  if (result.isError) {
    return makeDbErrObj(result, 'Error inserting comic');
  }

  const newComicIdRes = await queryDb<{ id: number }[]>(
    db,
    'SELECT id FROM comic WHERE name = ?',
    [uploadBody.comicName],
    'New comic ID'
  );
  if (newComicIdRes.isError) {
    return makeDbErrObj(newComicIdRes, 'Error getting new comic id');
  }
  if (newComicIdRes.result.length === 0) {
    return makeDbErrObj(newComicIdRes, 'Error getting new comic id - no result');
  }

  return { result: newComicIdRes.result[0].id };
}

async function createArtist(
  db: D1Database,
  newArtist: NewArtist,
  skipApproval: boolean
): ResultOrErrorPromise<{ artistId: number }> {
  const insertQuery = `
    INSERT INTO artist (name, e621name, patreonName, isPending)
    VALUES (?, ?, ?, ?)
  `;
  const insertValues = [
    newArtist.artistName.trim(),
    newArtist.e621Name ? newArtist.e621Name.trim() : null,
    newArtist.patreonName ? newArtist.patreonName.trim() : null,
    skipApproval ? 0 : 1,
  ];
  // TODO-db: insert id here..
  const dbRes = await queryDbExec(db, insertQuery, insertValues, 'Artist creation');
  if (dbRes.isError) {
    return makeDbErrObj(dbRes, 'Error inserting artist');
  }
  // const artistId = dbRes.insertId;
  const getNewArtistQuery = `SELECT id FROM artist WHERE name = ?`;
  const getNewArtistValues = [newArtist.artistName.trim()];
  const artistRes = await queryDb<{ id: number }[]>(
    db,
    getNewArtistQuery,
    getNewArtistValues,
    'New artist ID'
  );
  if (artistRes.isError) {
    return makeDbErrObj(artistRes, 'Error getting new artist id');
  }
  if (artistRes.result.length === 0) {
    return makeDbErrObj(artistRes, 'Error getting new artist id - no result');
  }
  const artistId = artistRes.result[0].id;

  if (newArtist.links && newArtist.links.length > 0) {
    const err = await createArtistLinks(db, newArtist, artistId);
    if (err) {
      return { err: wrapApiError(err, 'Error creating artist links') };
    }
  }

  return { result: { artistId } };
}

async function createArtistLinks(
  db: D1Database,
  newArtist: NewArtist,
  newArtistId: number
): Promise<ApiError | undefined> {
  const filteredLinks = newArtist.links.filter(link => link.length > 0);
  let linkInsertQuery = `INSERT INTO artistlink (ArtistId, LinkUrl) VALUES `;
  const linkInsertValues = [];

  for (let i = 0; i < filteredLinks.length; i++) {
    linkInsertQuery += `(?, ?)`;
    linkInsertValues.push(newArtistId, filteredLinks[i].trim());
    if (i < newArtist.links.length - 1) {
      linkInsertQuery += ', ';
    }
  }

  const dbRes = await queryDbExec(
    db,
    linkInsertQuery,
    linkInsertValues,
    'Artist links creation'
  );
  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error inserting artist links');
  }
}
