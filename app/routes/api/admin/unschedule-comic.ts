import { ActionArgs } from '@remix-run/cloudflare';
import { queryDb } from '~/utils/database-facade';
import { redirectIfNotMod } from '~/utils/loaders';
import {
  ApiError,
  create400Json,
  create500Json,
  createSuccessJson,
  logError,
} from '~/utils/request-helpers';
import { recalculatePublishingQueue } from '../funcs/publishing-queue';

export async function action(args: ActionArgs) {
  await redirectIfNotMod(args);
  const urlBase = args.context.DB_API_URL_BASE as string;

  const formDataBody = await args.request.formData();

  const formComicId = formDataBody.get('comicId');
  if (!formComicId) return create400Json('Missing comicId');

  const err = await unScheduleComic(urlBase, parseInt(formComicId.toString()));
  if (err) {
    logError(`Erorr in /unschedule-comic for comic id ${formComicId}`, err);
    return create500Json(err.clientMessage);
  }

  return createSuccessJson();
}

export async function unScheduleComic(
  urlBase: string,
  comicId: number
): Promise<ApiError | undefined> {
  const metadataQuery =
    'UPDATE comicmetadata SET publishDate = NULL, scheduleModId = NULL, publishingQueuePos = NULL WHERE comicId = ?';
  const comicQuery = `UPDATE comic SET publishStatus = 'pending' WHERE id = ?`;

  const [metadataDbRes, comicDbRes] = await Promise.all([
    queryDb(urlBase, metadataQuery, [comicId]),
    queryDb(urlBase, comicQuery, [comicId]),
  ]);

  if (metadataDbRes.errorMessage) {
    return {
      clientMessage: 'Error un-scheduling comic: Could not update comicmetadata table',
      logMessage: 'Error un-scheduling: could not update comicmetadata table',
      error: metadataDbRes,
    };
  }
  if (comicDbRes.errorMessage) {
    return {
      clientMessage: 'Error un-scheduling comic: Could not update comic table',
      logMessage: 'Error un-scheduling: could not update comic table',
      error: comicDbRes,
    };
  }

  recalculatePublishingQueue(urlBase); // Can run in background
}
