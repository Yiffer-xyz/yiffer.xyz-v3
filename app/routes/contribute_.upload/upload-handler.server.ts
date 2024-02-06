import { addContributionPoints } from '~/route-funcs/add-contribution-points';
import type { UserSession } from '~/types/types';
import { queryDb, queryDbExec } from '~/utils/database-facade';
import type { ApiError, ResultOrErrorPromise } from '~/utils/request-helpers';
import { makeDbErr, makeDbErrObj, wrapApiError } from '~/utils/request-helpers';
import type { NewArtist, UploadBody } from './route';

export async function processUpload(
  db: D1Database,
  uploadBody: UploadBody,
  user: UserSession | null,
  userIP?: string
): Promise<ApiError | undefined> {
  const skipApproval = !!user && ['moderator', 'admin'].includes(user?.userType);

  if (uploadBody.newArtist) {
    const createRes = await createArtist(db, uploadBody.newArtist, skipApproval);
    if (createRes.err)
      return wrapApiError(createRes.err, 'Error uploading', { uploadBody });
    uploadBody.artistId = createRes.result.artistId;
  }

  const dbRes = await createComic(db, uploadBody, skipApproval);
  if (dbRes.err) return wrapApiError(dbRes.err, 'Error uploading', { uploadBody });
  // TODO-db: rollback artist if failure
  const comicId = dbRes.result;

  const err = await createComicMetadata(
    db,
    comicId,
    uploadBody,
    skipApproval,
    user?.userId,
    userIP
  );
  if (err) return wrapApiError(err, 'Error uploading', { uploadBody });
  // TODO-db: rollback artist and comic if failure

  if (uploadBody.previousComic || uploadBody.nextComic) {
    const err = await createComicLinks(db, uploadBody, comicId);
    if (err) return wrapApiError(err, 'Error uploading', { uploadBody });
    // TODO-db: rollback artist and comic and metadata if failure
  }

  if (uploadBody.tagIds) {
    const err = await createComicTags(db, uploadBody.tagIds, comicId);
    if (err) return wrapApiError(err, 'Error uploading', { uploadBody });
    // TODO-db: rollback artist and comic and metadata (and links) if failure
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

  const dbRes = await queryDbExec(db, query, params);
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

  const dbRes = await queryDbExec(db, query, queryParams);
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
    (comicId, uploadUserId, uploadUserIP, uploadId, verdict)
    VALUES (?, ?, ?, ?, ?)
  `;

  const values = [
    comicId,
    userId || null,
    userIP || null,
    uploadBody.uploadId,
    skipApproval ? 'excellent' : null,
  ];

  const dbRes = await queryDbExec(db, query, values);
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
    (name, cat, tag, state, numberOfPages, artist, publishStatus)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    uploadBody.comicName.trim(),
    uploadBody.category,
    uploadBody.state,
    uploadBody.numberOfPages,
    uploadBody.artistId,
    skipApproval ? 'pending' : 'uploaded',
  ];

  const result = await queryDb(db, query, values);
  if (result.isError) {
    return makeDbErrObj(result, 'Error inserting comic');
  }
  // TODO-db: insertid
  if (!result.insertId) {
    return makeDbErrObj(result, 'Error inserting comic: no insert ID');
  }
  return { result: result.insertId };
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
  const dbRes = await queryDb(db, insertQuery, insertValues);
  if (dbRes.isError) {
    return makeDbErrObj(dbRes, 'Error inserting artist');
  }
  const artistId = dbRes.insertId;
  if (!artistId) {
    return makeDbErrObj(dbRes, 'Error inserting artist - no insert id');
  }

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

  const dbRes = await queryDbExec(db, linkInsertQuery, linkInsertValues);
  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error inserting artist links');
  }
}
