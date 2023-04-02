import { ActionArgs } from '@remix-run/cloudflare';
import { Artist, ComicUploadVerdict } from '~/types/types';
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
  await redirectIfNotMod(args);
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
  urlBase: string,
  comicId: number,
  comicName: string,
  frontendVerdict: ComicUploadVerdict,
  modComment?: string
): Promise<ApiError | undefined> {
  let publishStatus = 'pending';
  let verdict: ComicUploadVerdict = frontendVerdict.toString() as ComicUploadVerdict;
  if (frontendVerdict === 'rejected') publishStatus = 'rejected';
  if (frontendVerdict === 'rejected-list') {
    publishStatus = 'rejected-list';
    verdict = 'rejected';
  }

  let comicQuery = `UPDATE comic SET publishStatus = ? WHERE id = ?`;
  let comicQueryParams = [publishStatus, comicId];

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
  const artist = artistRes.artist as Artist;

  if (artist.isPending) {
    let pendingErr: ApiError | undefined;
    if (verdict === 'rejected' || verdict === 'rejected-list') {
      const rejectRes = await rejectArtistIfEmpty(urlBase, artist.id, artist.name);
      pendingErr = rejectRes.err;
    } else {
      pendingErr = await setArtistNotPending(urlBase, artist.id);
    }

    if (pendingErr) {
      return wrapApiError(pendingErr, `Error processing user upload`);
    }
  }

  let detailsQuery = `
    UPDATE comicmetadata 
    SET
      verdict = ?,
      modComment = ?
    WHERE comicId = ?`;
  let detailsQueryParams = [verdict, modComment, comicId];

  if (frontendVerdict === 'rejected') {
    detailsQuery = `
      UPDATE comicmetadata
      SET
        verdict = ?,
        modComment = ?,
        originalNameIfRejected = ?,
        originalArtistIfRejected = ?
      WHERE comicId = ?`;
    detailsQueryParams = [verdict, modComment, comicName, artist.name, comicId];
  }

  if (frontendVerdict === 'rejected-list') {
    detailsQuery = `
      UPDATE comicmetadata
      SET
        verdict = ?,
        modComment = ?,
        originalArtistIfRejected = ?,
      WHERE comicId = ?`;
    detailsQueryParams = [verdict, modComment, artist.name, comicId];
  }

  const detailsDbRes = await queryDb(urlBase, detailsQuery, detailsQueryParams);
  if (detailsDbRes.errorMessage) {
    return {
      clientMessage: 'Error updating comic details',
      logMessage: `Error updating comicmetadata`,
      error: detailsDbRes,
    };
  }
}
