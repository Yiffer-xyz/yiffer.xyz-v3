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
import { recalculatePublishingQueue } from '../funcs/publishing-queue';

export async function action(args: ActionArgs) {
  const user = await redirectIfNotMod(args);
  const urlBase = args.context.DB_API_URL_BASE as string;

  const formDataBody = await args.request.formData();
  const formComicId = formDataBody.get('comicId');
  if (!formComicId) return create400Json('Missing comicId');

  const err = await scheduleComic(urlBase, parseInt(formComicId.toString()), user.userId);
  if (err) {
    return processApiError('Error in /schedule-comic-to-queue', err);
  }
  return createSuccessJson();
}

export async function scheduleComic(
  urlBase: string,
  comicId: number,
  modId: number
): Promise<ApiError | undefined> {
  const metadataQuery = 'UPDATE comicmetadata SET scheduleModId = ? WHERE comicId = ?';
  const comicQuery = `UPDATE comic SET publishStatus = 'scheduled' WHERE id = ?`;

  const [comicDbRes, metadataDbRes] = await Promise.all([
    queryDb(urlBase, comicQuery, [comicId]),
    queryDb(urlBase, metadataQuery, [modId, comicId]),
  ]);

  const logCtx = { comicId, modId };
  if (comicDbRes.errorMessage) {
    return makeDbErr(comicDbRes, 'Could not update comic table', logCtx);
  }
  if (metadataDbRes.errorMessage) {
    return makeDbErr(metadataDbRes, 'Could not update metadata table', logCtx);
  }

  const err = await recalculatePublishingQueue(urlBase);
  if (err) {
    return wrapApiError(err, 'Error scheduling, recalculating', logCtx);
  }
}
