import { ActionArgs } from '@remix-run/cloudflare';
import { queryDb } from '~/utils/database-facade';
import { redirectIfNotMod } from '~/utils/loaders';
import {
  ApiError,
  create400Json,
  create500Json,
  createSuccessJson,
  logError,
  wrapApiError,
} from '~/utils/request-helpers';
import { getComicsByArtistId } from '../funcs/get-comics';
import { processUserUpload } from './process-user-upload';
import { rejectComic } from './reject-pending-comic';
import { unlistComic } from './unlist-comic';

export async function action(args: ActionArgs) {
  await redirectIfNotMod(args);
  const urlBase = args.context.DB_API_URL_BASE as string;

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
    formIsBanned === 'true'
  );
  if (err) {
    logError(
      `Error in /toggle-artist-ban for artist id ${formArtistId.toString()}, is banned: ${formIsBanned}`,
      err
    );
    return create500Json(err.clientMessage);
  }

  return createSuccessJson();
}

export async function toggleArtistBan(
  urlBase: string,
  artistId: number,
  isBanned: boolean
): Promise<ApiError | undefined> {
  const query = `UPDATE artist SET isBanned = ? WHERE id = ?`;
  const params = [isBanned, artistId];
  const dbRes = await queryDb(urlBase, query, params);
  if (dbRes.errorMessage) {
    return {
      clientMessage: 'Error setting artist banned/unbanned',
      logMessage: 'Error banning/unbanning artist',
      error: dbRes,
    };
  }

  if (!isBanned) return;

  const { comics, err } = await getComicsByArtistId(urlBase, artistId);
  if (err) {
    return wrapApiError(err, 'Error banning/unbanning artist');
  }
  if (!comics || comics.length === 0) return;

  const liveComics = comics.filter(c => c.publishStatus === 'published');
  const pendingComics = comics.filter(c => c.publishStatus === 'pending');
  const uploadedComics = comics.filter(c => c.publishStatus === 'uploaded');

  const processComicPromises: Promise<ApiError | undefined>[] = [];
  const logBodies: any[] = [];

  liveComics.forEach(c => {
    processComicPromises.push(unlistComic(urlBase, c.id, 'Artist banned'));
    logBodies.push(`comic name/id ${c.name} / ${c.id}`);
  });
  pendingComics.forEach(c => {
    processComicPromises.push(rejectComic(urlBase, c.id));
    logBodies.push(`comic name/id ${c.name} / ${c.id}`);
  });
  uploadedComics.forEach(c => {
    processComicPromises.push(
      processUserUpload(urlBase, c.id, c.name, 'rejected', 'Artist rejected/banned')
    );
    logBodies.push(`comic name/id ${c.name} / ${c.id}`);
  });

  const processErrors = await Promise.all(processComicPromises);

  for (let i = 0; i < processErrors.length; i++) {
    const err = processErrors[i];
    if (err !== undefined) {
      return wrapApiError(err, `Error banning artist, for ${logBodies[i]}`);
    }
  }
}
