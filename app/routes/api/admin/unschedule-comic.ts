import { ActionArgs } from '@remix-run/cloudflare';
import { queryDb } from '~/utils/database-facade';
import { redirectIfNotMod } from '~/utils/loaders';
import {
  ApiError,
  create400Json,
  createSuccessJson,
  makeDbErr,
  processApiError,
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
    return processApiError('Error in /unschedule-comic', err);
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

  if (metadataDbRes.isError) {
    return makeDbErr(metadataDbRes, 'Could not update comicmetadata', { comicId });
  }
  if (comicDbRes.isError) {
    return makeDbErr(comicDbRes, 'Could not update comic table', { comicId });
  }

  recalculatePublishingQueue(urlBase); // Can run in background
}
