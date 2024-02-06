import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { queryDbMultiple } from '~/utils/database-facade';
import { redirectIfNotMod } from '~/utils/loaders';
import type { ApiError } from '~/utils/request-helpers';
import {
  create400Json,
  createSuccessJson,
  makeDbErr,
  processApiError,
} from '~/utils/request-helpers';
import { recalculatePublishingQueue } from '~/route-funcs/publishing-queue';

export async function action(args: ActionFunctionArgs) {
  const user = await redirectIfNotMod(args);

  const formDataBody = await args.request.formData();
  const formComicId = formDataBody.get('comicId');
  const formPublishDate = formDataBody.get('publishDate');

  if (!formComicId) return create400Json('Missing comicId');
  if (!formPublishDate) return create400Json('Missing publishDate');

  const err = await scheduleComic(
    args.context.DB,
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
  db: D1Database,
  comicId: number,
  publishDate: string,
  modId: number
): Promise<ApiError | undefined> {
  const metadataQuery =
    'UPDATE comicmetadata SET publishDate = ?, scheduleModId = ?, publishingQueuePos = NULL WHERE comicId = ?';
  const comicQuery = `UPDATE comic SET publishStatus = 'scheduled' WHERE id = ?`;

  const dbRes = await queryDbMultiple(
    db,
    [
      {
        query: comicQuery,
        params: [comicId],
        errorLogMessage: 'Could not update comic table',
      },
      {
        query: metadataQuery,
        params: [modId, comicId],
        errorLogMessage: 'Could not update metadata table',
      },
    ],
    'Error updating comic+metadata in scheduleComic'
  );

  const logCtx = { comicId, publishDate, modId };

  if (dbRes.isError) {
    return makeDbErr(dbRes, dbRes.errorMessage, logCtx);
  }

  recalculatePublishingQueue(db); // Can run in background
}
