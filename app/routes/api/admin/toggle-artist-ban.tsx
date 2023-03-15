import { ActionArgs } from '@remix-run/cloudflare';
import { queryDbDirect } from '~/utils/database-facade';
import { redirectIfNotMod } from '~/utils/loaders';
import {
  create400Json,
  create500Json,
  createGeneric500Json,
  createSuccessJson,
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
  const formIsBanned = formDataBody.get('isBanned');
  if (!formIsBanned) return create400Json('Missing isBanned');
  if (formIsBanned !== 'true' && formIsBanned !== 'false') {
    return create400Json('isBanned must be true or false');
  }

  try {
    await toggleArtistBan(
      urlBase,
      parseInt(formArtistId.toString()),
      formIsBanned === 'true'
    );
  } catch (e) {
    return e instanceof Error ? create500Json(e.message) : createGeneric500Json();
  }

  return createSuccessJson();
}

export async function toggleArtistBan(
  urlBase: string,
  artistId: number,
  isBanned: boolean
) {
  const query = `UPDATE artist SET isBanned = ? WHERE id = ?`;
  const params = [isBanned, artistId];
  await queryDbDirect(urlBase, query, params);

  if (isBanned) {
    const comics = await getComicsByArtistId(urlBase, artistId);
    if (comics.length === 0) return;

    const liveComics = comics.filter(c => c.publishStatus === 'published');
    const pendingComics = comics.filter(c => c.publishStatus === 'pending');
    const uploadedComics = comics.filter(c => c.publishStatus === 'uploaded');

    const processComicPromises: Promise<any>[] = [];

    liveComics.forEach(c => {
      processComicPromises.push(unlistComic(urlBase, c.id, 'Artist banned'));
    });
    pendingComics.forEach(c => {
      processComicPromises.push(rejectComic(urlBase, c.id));
    });
    uploadedComics.forEach(c => {
      processComicPromises.push(
        processUserUpload(urlBase, c.id, c.name, 'rejected', 'Artist rejected/banned')
      );
    });

    await Promise.all(processComicPromises);
  }
}
