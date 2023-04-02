import { ActionArgs } from '@remix-run/cloudflare';
import { AllowedAnonComicVerdict } from '~/routes/admin/comics/AnonUploadedComicSection';
import { Artist } from '~/types/types';
import { queryDb } from '~/utils/database-facade';
import { randomString } from '~/utils/general';
import { redirectIfNotMod } from '~/utils/loaders';
import {
  ApiError,
  create400Json,
  create500Json,
  createSuccessJson,
  logError,
} from '~/utils/request-helpers';
import { getArtistByComicId } from '../funcs/get-artist';
import { rejectArtistIfEmpty, setArtistNotPending } from './manage-artist';

export async function action(args: ActionArgs) {
  const user = await redirectIfNotMod(args);
  const urlBase = args.context.DB_API_URL_BASE as string;

  const formDataBody = await args.request.formData();

  const formComicId = formDataBody.get('comicId');
  if (!formComicId) return create400Json('Missing comicId');

  const comicName = formDataBody.get('comicName');
  if (!comicName) return create400Json('Missing comicName');

  const formVerdict = formDataBody.get('verdict');
  if (!formVerdict) return create400Json('Missing verdict');
  const verdict = formVerdict.toString() as AllowedAnonComicVerdict;

  let query: string;
  let queryParams: any[];
  const comicId = parseInt(formComicId.toString());

  if (verdict === 'approved' || verdict === 'rejected-list') {
    const newStatus = verdict === 'approved' ? 'pending' : 'rejected-list';
    query = 'UPDATE comic SET publishStatus = ? WHERE id = ?';
    queryParams = [newStatus, comicId];
  } else {
    const randomStr = randomString(6);
    const newComicName = `${comicName}-REJECTED-${randomStr}`;
    query = `UPDATE comic SET publishStatus = 'rejected', name = ? WHERE id = ?`;
    queryParams = [newComicName, comicId];
  }

  const metadataQuery = `UPDATE comicmetadata SET modId = ? WHERE comicId = ?`;
  const metadataQueryParams = [user.userId, comicId];

  const [artistRes, updateComicDbRes, metadataDbRes] = await Promise.all([
    getArtistByComicId(urlBase, comicId),
    queryDb(urlBase, query, queryParams),
    queryDb(urlBase, metadataQuery, metadataQueryParams),
  ]);

  if (updateComicDbRes.errorMessage) {
    logError(`Error processing anon upload, comic table`, updateComicDbRes);
    return create500Json('Error processing upload');
  }
  if (metadataDbRes.errorMessage) {
    logError('Error processing anon upload, metadata table', metadataDbRes);
    return create500Json('Error processing upload');
  }
  if (artistRes.notFound) {
    return create400Json('Artist not found');
  }
  if (artistRes.err) {
    logError('Error processing anon upload, artist table', artistRes.err);
    return create500Json(artistRes.err.clientMessage);
  }
  const artist = artistRes.artist as Artist;

  if (artist.isPending) {
    let pendingErr: ApiError | undefined;
    if (verdict === 'approved') {
      pendingErr = await setArtistNotPending(urlBase, artist.id);
    } else {
      const rejectRes = await rejectArtistIfEmpty(urlBase, artist.id, artist.name);
      pendingErr = rejectRes.err;
    }

    if (pendingErr) {
      logError(
        `Error processing anon upload. Name/id: ${comicName}, ${comicId}`,
        pendingErr
      );
      return create500Json(pendingErr.clientMessage);
    }
  }

  return createSuccessJson();
}
