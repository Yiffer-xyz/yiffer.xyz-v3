import { queryDbExec } from '~/utils/database-facade';
import { redirectIfNotMod } from '~/utils/loaders';
import type { ApiError, noGetRoute } from '~/utils/request-helpers';
import {
  create400Json,
  createSuccessJson,
  makeDbErr,
  processApiError,
  wrapApiError,
} from '~/utils/request-helpers';
import { getComicsByArtistField } from '~/route-funcs/get-comics';
import { processUserUpload } from './api.admin.process-user-upload';
import { rejectComic } from './api.admin.reject-pending-comic';
import { unlistComic } from './api.admin.unlist-comic';
import { boolToInt } from '~/utils/general';
import type { ActionFunctionArgs } from '@remix-run/cloudflare';

export { noGetRoute as loader };

export async function action(args: ActionFunctionArgs) {
  const user = await redirectIfNotMod(args);

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
    args.context.cloudflare.env.DB,
    args.context.cloudflare.env.IMAGES_SERVER_URL,
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
  db: D1Database,
  imagesServerUrl: string,
  artistId: number,
  isBanned: boolean,
  modId: number
): Promise<ApiError | undefined> {
  const logCtx = { artistId, isBanned, modId };
  const query = `UPDATE artist SET isBanned = ? WHERE id = ?`;
  const params = [boolToInt(isBanned), artistId];
  const dbRes = await queryDbExec(db, query, params, 'Artist ban/unban');
  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error 1 banning/unbanning artist', logCtx);
  }

  if (!isBanned) return;

  const comicsRes = await getComicsByArtistField(db, 'id', artistId);
  if (comicsRes.err) {
    return wrapApiError(comicsRes.err, 'Error 2 banning/unbanning artist', logCtx);
  }
  if (comicsRes.result.length === 0) return;

  const liveComics = comicsRes.result.filter(c => c.publishStatus === 'published');
  const pendingComics = comicsRes.result.filter(c => c.publishStatus === 'pending');
  const uploadedComics = comicsRes.result.filter(c => c.publishStatus === 'uploaded');

  // These should ideally all be in one transaction but that seems somewhat of a nightmare...
  const processComicPromises: Promise<ApiError | undefined>[] = [
    ...liveComics.map(c => unlistComic(db, c.id, 'Artist banned')),
    ...pendingComics.map(c => rejectComic(db, c.id)),
    ...uploadedComics.map(c =>
      processUserUpload({
        modId,
        db,
        comicId: c.id,
        comicName: c.name,
        frontendVerdict: 'rejected',
        modComment: 'Artist rejected/banned',
        imagesServerUrl,
        uploaderId: undefined,
      })
    ),
  ];

  const processErrors = await Promise.all(processComicPromises);

  for (const err of processErrors) {
    if (err) {
      return wrapApiError(err, 'Error 3 banning/unbanning artist', logCtx);
    }
  }
}
