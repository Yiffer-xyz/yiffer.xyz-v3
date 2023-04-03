import { ActionArgs } from '@remix-run/cloudflare';
import { ComicPublishStatus, ComicUploadVerdict } from '~/types/types';
import { queryDb } from '~/utils/database-facade';
import { randomString } from '~/utils/general';
import { redirectIfNotMod } from '~/utils/loaders';
import {
  ApiError,
  create400Json,
  create500Json,
  createSuccessJson,
  logError,
  wrapApiError,
} from '~/utils/request-helpers';
import { getArtistByComicId } from '../funcs/get-artist';
import { rejectArtistIfEmpty, setArtistNotPending } from './manage-artist';

export async function action(args: ActionArgs) {
  const user = await redirectIfNotMod(args);
  const urlBase = args.context.DB_API_URL_BASE as string;

  const formDataBody = await args.request.formData();

  const formComicId = formDataBody.get('comicId');
  if (!formComicId) return create400Json('Missing comicId');
  const formVerdict = formDataBody.get('verdict');
  if (!formVerdict) return create400Json('Missing verdict');
  const formComicName = formDataBody.get('comicName');
  if (!formComicName) return create400Json('Missing comicName');

  const verdict: ComicUploadVerdict = formVerdict.toString() as ComicUploadVerdict;
  const formModComment = formDataBody.get('modComment');
  const modComment = formModComment ? formModComment.toString() : undefined;
  const comicId = parseInt(formComicId.toString());

  const err = await processUserUpload(
    user.userId,
    urlBase,
    comicId,
    formComicName.toString(),
    verdict,
    modComment
  );

  if (err) {
    logError(
      `Error in /process-user-upload for comic name/id ${formComicName.toString()} / ${comicId}, verdict: ${verdict}`,
      err
    );
    create500Json(err.clientMessage);
  }

  return createSuccessJson();
}

export async function processUserUpload(
  modId: number,
  urlBase: string,
  comicId: number,
  comicName: string,
  frontendVerdict: ComicUploadVerdict,
  modComment?: string
): Promise<ApiError | undefined> {
  let publishStatus: ComicPublishStatus = 'pending';
  let metadataVerdict: ComicUploadVerdict =
    frontendVerdict.toString() as ComicUploadVerdict;
  if (frontendVerdict === 'rejected') publishStatus = 'rejected';
  if (frontendVerdict === 'rejected-list') {
    publishStatus = 'rejected-list';
    metadataVerdict = 'rejected';
  }

  const err = await processAnyUpload(
    modId,
    urlBase,
    comicId,
    comicName,
    modComment,
    publishStatus,
    frontendVerdict,
    metadataVerdict
  );

  if (err) {
    return wrapApiError(err, 'Error processing logged-in-user upload');
  }
}

export async function processAnyUpload(
  modId: number,
  urlBase: string,
  comicId: number,
  comicName: string,
  modComment: string | undefined,
  publishStatus: ComicPublishStatus,
  frontendVerdict: ComicUploadVerdict,
  metadataVerdict: ComicUploadVerdict | undefined
): Promise<ApiError | undefined> {
  let comicQuery = `UPDATE comic SET publishStatus = ? WHERE id = ?`;
  let comicQueryParams: any[] = [publishStatus, comicId];
  const isRejected = publishStatus === 'rejected' || publishStatus === 'rejected-list';

  if (frontendVerdict === 'rejected') {
    const randomStr = randomString(6);
    const newComicName = `${comicName}-REJECTED-${randomStr}`;
    comicQuery = `UPDATE comic SET publishStatus = ?, name = ? WHERE id = ?`;
    comicQueryParams = [publishStatus, newComicName, comicId];
  }

  const [artistRes, updateComicDbRes] = await Promise.all([
    getArtistByComicId(urlBase, comicId),
    queryDb(urlBase, comicQuery, comicQueryParams),
  ]);

  if (updateComicDbRes.errorMessage) {
    return {
      clientMessage: 'Error processing upload',
      logMessage: `Error updating comic in db (processUserUpload)`,
      error: updateComicDbRes,
    };
  }
  if (artistRes.notFound) {
    return {
      clientMessage: 'Artist not found',
      logMessage: `Error getting artist (processUserUpload)`,
    };
  }
  if (artistRes.err) {
    return wrapApiError(artistRes.err, `Error getting artist (processUserUpload)`);
  }
  const artist = artistRes.artist!;

  if (artist.isPending) {
    let pendingErr: ApiError | undefined;
    if (isRejected) {
      const rejectRes = await rejectArtistIfEmpty(urlBase, artist.id, artist.name);
      pendingErr = rejectRes.err;
    } else {
      pendingErr = await setArtistNotPending(urlBase, artist.id);
    }

    if (pendingErr) {
      return wrapApiError(pendingErr, `Error processing user upload`);
    }
  }

  let metadataQuery = 'UPDATE comicmetadata SET modId = ? WHERE comicId = ?';
  let metadataQueryParams: any[] = [modId, comicId];

  if (metadataVerdict) {
    metadataQuery = `
    UPDATE comicmetadata 
    SET
      verdict = ?,
      modComment = ?,
      modId = ?
    WHERE comicId = ?`;
    metadataQueryParams = [metadataVerdict, modComment, modId, comicId];
  }

  if (frontendVerdict === 'rejected') {
    if (metadataVerdict) {
      // For user uploads
      metadataQuery = `
        UPDATE comicmetadata
        SET
          verdict = ?,
          modComment = ?,
          modId = ?,
          originalNameIfRejected = ?,
          originalArtistIfRejected = ?
        WHERE comicId = ?`;
      metadataQueryParams = [
        metadataVerdict,
        modComment,
        modId,
        comicName,
        artist.name,
        comicId,
      ];
    } else {
      // For anon: Only names
      metadataQuery = `
        UPDATE comicmetadata
        SET
          modId = ?,
          originalNameIfRejected = ?,
          originalArtistIfRejected = ?
        WHERE comicId = ?`;
      metadataQueryParams = [modId, comicName, artist.name, comicId];
    }
  }

  if (frontendVerdict === 'rejected-list') {
    if (metadataVerdict) {
      // For user uploads
      metadataQuery = `
      UPDATE comicmetadata
      SET
        verdict = ?,
        modComment = ?,
        modId = ?,
        originalArtistIfRejected = ?
      WHERE comicId = ?`;
      metadataQueryParams = [metadataVerdict, modComment, modId, artist.name, comicId];
    } else {
      // For anon: Only names
      metadataQuery = `
        UPDATE comicmetadata
        SET
          modId = ?,
          originalArtistIfRejected = ?
        WHERE comicId = ?`;
      metadataQueryParams = [modId, artist.name, comicId];
    }
  }

  if (!metadataQuery) return;

  const metadataDbRes = await queryDb(urlBase, metadataQuery, metadataQueryParams);
  if (metadataDbRes.errorMessage) {
    return {
      clientMessage: 'Error updating comic metadata',
      logMessage: `Error updating comicmetadata`,
      error: metadataDbRes,
    };
  }
}
