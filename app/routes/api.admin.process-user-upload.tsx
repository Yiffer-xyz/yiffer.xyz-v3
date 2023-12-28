import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import type { ComicPublishStatus, ComicUploadVerdict } from '~/types/types';
import { queryDb } from '~/utils/database-facade';
import { randomString } from '~/utils/general';
import { redirectIfNotMod } from '~/utils/loaders';
import type { ApiError } from '~/utils/request-helpers';
import {
  create400Json,
  createSuccessJson,
  makeDbErr,
  processApiError,
  wrapApiError,
} from '~/utils/request-helpers';
import { addContributionPoints } from '~/route-funcs/add-contribution-points';
import { getArtistByComicId } from '~/route-funcs/get-artist';
import { rejectArtistIfEmpty, setArtistNotPending } from '../route-funcs/manage-artist';

export async function action(args: ActionFunctionArgs) {
  const user = await redirectIfNotMod(args);
  const urlBase = args.context.DB_API_URL_BASE;

  const formDataBody = await args.request.formData();

  const formComicId = formDataBody.get('comicId');
  if (!formComicId) return create400Json('Missing comicId');
  const formVerdict = formDataBody.get('verdict');
  if (!formVerdict) return create400Json('Missing verdict');
  const formComicName = formDataBody.get('comicName');
  if (!formComicName) return create400Json('Missing comicName');
  const formUploaderId = formDataBody.get('uploaderId');
  if (!formUploaderId) return create400Json('Missing uploaderId');

  const verdict: ComicUploadVerdict = formVerdict.toString() as ComicUploadVerdict;
  const formModComment = formDataBody.get('modComment');
  const modComment = formModComment ? formModComment.toString() : undefined;
  const comicId = parseInt(formComicId.toString());
  const uploaderId = parseInt(formUploaderId.toString());

  const err = await processUserUpload(
    user.userId,
    urlBase,
    comicId,
    formComicName.toString(),
    verdict,
    modComment,
    uploaderId
  );

  if (err) {
    return processApiError('Error in /process-user-upload', err);
  }
  return createSuccessJson();
}

export async function processUserUpload(
  modId: number,
  urlBase: string,
  comicId: number,
  comicName: string,
  frontendVerdict: ComicUploadVerdict,
  modComment: string | undefined,
  uploaderId?: number
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
    metadataVerdict,
    uploaderId
  );

  if (err) {
    return wrapApiError(err, 'Error processing logged-in-user upload', {
      comicId,
      frontendVerdict,
      metadataVerdict,
      modComment,
    });
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
  metadataVerdict: ComicUploadVerdict | undefined,
  userUploadId?: number
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

  if (updateComicDbRes.isError) {
    return makeDbErr(updateComicDbRes, 'Error updating comic in db');
  }
  if (artistRes.err) {
    return wrapApiError(artistRes.err, `Error getting artist`);
  }
  if (artistRes.notFound) {
    return { logMessage: 'Artist not found' };
  }
  const artist = artistRes.result;

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

  const dbTableName =
    frontendVerdict === 'rejected' || frontendVerdict === 'rejected-list'
      ? 'comicUploadRejected'
      : `comicUpload${frontendVerdict.replace('-', '')}`;
  const err = await addContributionPoints(urlBase, userUploadId ?? null, dbTableName);
  if (err) {
    return wrapApiError(err, `Error adding contribution points`);
  }

  if (!metadataQuery) return;

  const metadataDbRes = await queryDb(urlBase, metadataQuery, metadataQueryParams);
  if (metadataDbRes.isError) {
    return makeDbErr(metadataDbRes, 'Error updating comic metadata in db');
  }
}
