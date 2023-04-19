import { ActionArgs } from '@remix-run/cloudflare';
import { queryDb } from '~/utils/database-facade';
import { redirectIfNotMod } from '~/utils/loaders';
import {
  ApiError,
  create400Json,
  createSuccessJson,
  makeDbErr,
  processApiError,
  wrapApiError,
} from '~/utils/request-helpers';
import { getComicsByArtistId } from '../funcs/get-comics';
import { processUserUpload } from './process-user-upload';
import { rejectComic } from './reject-pending-comic';
import { unlistComic } from './unlist-comic';

export async function action(args: ActionArgs) {
  const user = await redirectIfNotMod(args);
  const urlBase = args.context.DB_API_URL_BASE;

  const formDataBody = await args.request.formData();

  const formArtistId = formDataBody.get('artistId');
  if (!formArtistId) return create400Json('Missing artistId');

  let formIsBanned = formDataBody.get('isBanned');
  if (!formIsBanned) return create400Json('Missing isBanned');
  formIsBanned = formIsBanned.toString();
  if (formIsBanned !== 'true' && formIsBanned !== 'false') {
    return create400Json('isBanned must be true or false');
  }

  const err = await toggleArtistBan(
    urlBase,
    parseInt(formArtistId.toString()),
    formIsBanned === 'true',
    user.userId
  );
  if (err) {
    return processApiError('Error in /toggle-artist-ban', err);
  }
  return createSuccessJson();
}

export async function toggleArtistBan(
  urlBase: string,
  artistId: number,
  isBanned: boolean,
  modId: number
): Promise<ApiError | undefined> {
  const logCtx = { artistId, isBanned, modId };
  const query = `UPDATE artist SET isBanned = ? WHERE id = ?`;
  const params = [isBanned, artistId];
  const dbRes = await queryDb(urlBase, query, params);
  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error banning/unbanning artist', logCtx);
  }

  if (!isBanned) return;

  const { comics, err } = await getComicsByArtistId(urlBase, artistId);
  if (err) {
    return wrapApiError(err, 'Error banning/unbanning artist', logCtx);
  }
  if (!comics || comics.length === 0) return;

  const liveComics = comics.filter(c => c.publishStatus === 'published');
  const pendingComics = comics.filter(c => c.publishStatus === 'pending');
  const uploadedComics = comics.filter(c => c.publishStatus === 'uploaded');

  const processComicPromises: Promise<ApiError | undefined>[] = [
    ...liveComics.map(c => unlistComic(urlBase, c.id, 'Artist banned')),
    ...pendingComics.map(c => rejectComic(urlBase, c.id)),
    ...uploadedComics.map(c =>
      processUserUpload(
        modId,
        urlBase,
        c.id,
        c.name,
        'rejected',
        'Artist rejected/banned'
      )
    ),
  ];

  const processErrors = await Promise.all(processComicPromises);

  for (let err of processErrors) {
    if (err) {
      return wrapApiError(err, 'Error banning/unbanning artist', logCtx);
    }
  }
}
