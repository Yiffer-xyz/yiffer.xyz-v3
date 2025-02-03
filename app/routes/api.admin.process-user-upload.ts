import type { ComicPublishStatus, ComicUploadVerdict } from '~/types/types';
import { queryDbExec } from '~/utils/database-facade';
import { randomString } from '~/utils/general';
import { redirectIfNotMod } from '~/utils/loaders';
import type { ApiError, noGetRoute } from '~/utils/request-helpers';
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
import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { addModLogAndPoints } from '~/route-funcs/add-mod-log-and-points';
import { getComicByField } from '~/route-funcs/get-comic';

export { noGetRoute as loader };

export async function action(args: ActionFunctionArgs) {
  const user = await redirectIfNotMod(args);

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

  const err = await processUserUpload({
    modId: user.userId,
    db: args.context.cloudflare.env.DB,
    comicId,
    comicName: formComicName.toString(),
    frontendVerdict: verdict,
    modComment,
    imagesServerUrl: args.context.cloudflare.env.IMAGES_SERVER_URL,
    uploaderId,
  });

  if (err) {
    return processApiError('Error in /process-user-upload', err);
  }

  let logText = `Verdict: ${verdict}`;
  if (modComment) logText += ` \nMod comment: ${modComment}`;
  const modLogErr = await addModLogAndPoints({
    db: args.context.cloudflare.env.DB,
    userId: user.userId,
    comicId,
    actionType: 'upload-processed',
    text: logText,
  });
  if (modLogErr) {
    return processApiError('Error in /process-user-upload', modLogErr);
  }

  return createSuccessJson();
}

export async function processUserUpload({
  modId,
  db,
  comicId,
  comicName,
  frontendVerdict,
  modComment,
  imagesServerUrl,
  uploaderId,
}: {
  modId: number;
  db: D1Database;
  comicId: number;
  comicName: string;
  frontendVerdict: ComicUploadVerdict;
  modComment: string | undefined;
  imagesServerUrl: string;
  uploaderId?: number;
}): Promise<ApiError | undefined> {
  let publishStatus: ComicPublishStatus = 'pending';
  let metadataVerdict: ComicUploadVerdict =
    frontendVerdict.toString() as ComicUploadVerdict;
  if (frontendVerdict === 'rejected') publishStatus = 'rejected';
  if (frontendVerdict === 'rejected-list') {
    publishStatus = 'rejected-list';
    metadataVerdict = 'rejected';
  }

  const err = await processAnyUpload({
    modId,
    db,
    comicId,
    comicName,
    modComment,
    publishStatus,
    frontendVerdict,
    metadataVerdict,
    imagesServerUrl,
    userUploadId: uploaderId,
  });

  if (err) {
    return wrapApiError(err, 'Error processing logged-in-user upload', {
      comicId,
      frontendVerdict,
      metadataVerdict,
      modComment,
    });
  }
}

export async function processAnyUpload({
  modId,
  db,
  comicId,
  comicName,
  modComment,
  publishStatus,
  frontendVerdict,
  metadataVerdict,
  imagesServerUrl,
  userUploadId,
}: {
  modId: number;
  db: D1Database;
  comicId: number;
  comicName: string;
  modComment: string | undefined;
  publishStatus: ComicPublishStatus;
  frontendVerdict: ComicUploadVerdict;
  metadataVerdict: ComicUploadVerdict | undefined;
  imagesServerUrl: string;
  userUploadId?: number;
}): Promise<ApiError | undefined> {
  let comicQuery = `UPDATE comic SET publishStatus = ? WHERE id = ?`;
  let comicQueryParams: any[] = [publishStatus, comicId];
  const isRejected = publishStatus === 'rejected' || publishStatus === 'rejected-list';

  if (frontendVerdict === 'rejected') {
    const randomStr = randomString(6);
    const newComicName = `${comicName}-REJECTED-${randomStr}`;

    const comicRes = await getComicByField({
      db,
      fieldName: 'id',
      fieldValue: comicId,
      includeMetadata: false,
    });
    if (comicRes.err) {
      return wrapApiError(comicRes.err, `Error getting comic`);
    }
    if (comicRes.notFound) {
      return {
        logMessage: 'Comic not found',
        context: { comicId },
      };
    }
    const fullComic = comicRes.result;

    try {
      const response = await fetch(`${imagesServerUrl}/rename-comic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prevComicName: comicName,
          newComicName,
          numPages: fullComic.numberOfPages,
        }),
      });
      if (!response.ok) {
        return {
          logMessage: 'Error renaming comic pages',
          context: { comicId },
        };
      }
    } catch (err) {
      return {
        logMessage: 'Error renaming comic pages',
        context: { comicId },
      };
    }

    comicQuery = `UPDATE comic SET publishStatus = ?, name = ? WHERE id = ?`;
    comicQueryParams = [publishStatus, newComicName, comicId];
  }

  const [artistRes, updateComicDbRes] = await Promise.all([
    getArtistByComicId(db, comicId),
    queryDbExec(db, comicQuery, comicQueryParams, 'Comic update, upload'),
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
      const rejectRes = await rejectArtistIfEmpty(db, artist.id, artist.name);
      pendingErr = rejectRes.err;
    } else {
      pendingErr = await setArtistNotPending(db, artist.id);
    }

    if (pendingErr) {
      return wrapApiError(pendingErr, `Error processing user upload`);
    }
  }

  let metadataQuery = 'UPDATE comicmetadata SET modId = ? WHERE comicId = ?';
  let metadataQueryParams: any[] = [modId, comicId];
  const maybeModCommentStr = modComment ? ' modComment = ?, ' : '';

  if (metadataVerdict) {
    metadataQuery = `
    UPDATE comicmetadata 
    SET
      verdict = ?,
      ${maybeModCommentStr}
      modId = ?
    WHERE comicId = ?`;
    metadataQueryParams = modComment
      ? [metadataVerdict, modComment, modId, comicId]
      : [metadataVerdict, modId, comicId];
  }

  if (frontendVerdict === 'rejected') {
    if (metadataVerdict) {
      // For user uploads
      metadataQuery = `
        UPDATE comicmetadata
        SET
          verdict = ?,
          ${maybeModCommentStr}
          modId = ?,
          originalNameIfRejected = ?,
          originalArtistIfRejected = ?
        WHERE comicId = ?`;
      metadataQueryParams = modComment
        ? [metadataVerdict, modComment, modId, comicName, artist.name, comicId]
        : [metadataVerdict, modId, comicName, artist.name, comicId];
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
        ${maybeModCommentStr}
        modId = ?,
        originalArtistIfRejected = ?
      WHERE comicId = ?`;
      metadataQueryParams = modComment
        ? [metadataVerdict, modComment, modId, artist.name, comicId]
        : [metadataVerdict, modId, artist.name, comicId];
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
  const err = await addContributionPoints(db, userUploadId ?? null, dbTableName);
  if (err) {
    return wrapApiError(err, `Error adding contribution points`);
  }

  if (!metadataQuery) return;

  const metadataDbRes = await queryDbExec(
    db,
    metadataQuery,
    metadataQueryParams,
    'Comic metadata update'
  );
  if (metadataDbRes.isError) {
    return makeDbErr(metadataDbRes, 'Error updating comic metadata in db');
  }
}
