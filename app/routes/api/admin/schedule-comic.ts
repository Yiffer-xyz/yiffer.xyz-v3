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
  const user = await redirectIfNotMod(args);
  const urlBase = args.context.DB_API_URL_BASE as string;

  const formDataBody = await args.request.formData();

  const formComicId = formDataBody.get('comicId');
  const formPublishDate = formDataBody.get('publishDate');

  if (!formComicId) return create400Json('Missing comicId');
  if (!formPublishDate) return create400Json('Missing publishDate');

  const err = await scheduleComic(
    urlBase,
    parseInt(formComicId.toString()),
    formPublishDate.toString(),
    user.userId
  );
  if (err) {
    return processApiError('Error in /schedule-comic', err);
  }
  return createSuccessJson();
}

export async function scheduleComic(
  urlBase: string,
  comicId: number,
  publishDate: string,
  modId: number
): Promise<ApiError | undefined> {
  const metadataQuery =
    'UPDATE comicmetadata SET publishDate = ?, scheduleModId = ?, publishingQueuePos = NULL WHERE comicId = ?';
  const comicQuery = `UPDATE comic SET publishStatus = 'scheduled' WHERE id = ?`;

  const [metadataDbRes, comicDbRes] = await Promise.all([
    queryDb(urlBase, metadataQuery, [publishDate, modId, comicId]),
    queryDb(urlBase, comicQuery, [comicId]),
  ]);

  const logCtx = { comicId, publishDate, modId };
  if (metadataDbRes.errorMessage) {
    return makeDbErr(metadataDbRes, 'Could not update metadata table', logCtx);
  }
  if (comicDbRes.errorMessage) {
    return makeDbErr(comicDbRes, 'Could not update comic table', logCtx);
  }

  recalculatePublishingQueue(urlBase); // Can run in background
}
