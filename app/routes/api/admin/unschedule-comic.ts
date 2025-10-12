import type { Route } from './+types/unschedule-comic';
import { queryDbMultiple } from '~/utils/database-facade';
import { redirectIfNotMod } from '~/utils/loaders';
import { type ApiError, noGetRoute } from '~/utils/request-helpers';
import {
  create400Json,
  createSuccessJson,
  makeDbErr,
  processApiError,
} from '~/utils/request-helpers';
import { recalculatePublishingQueue } from '~/route-funcs/publishing-queue';

export { noGetRoute as loader };

export async function action(args: Route.ActionArgs) {
  await redirectIfNotMod(args);

  const formDataBody = await args.request.formData();
  const formComicId = formDataBody.get('comicId');
  if (!formComicId) return create400Json('Missing comicId');

  const err = await unScheduleComic(
    args.context.cloudflare.env.DB,
    parseInt(formComicId.toString())
  );
  if (err) {
    return processApiError('Error in /unschedule-comic', err);
  }
  return createSuccessJson();
}

export async function unScheduleComic(
  db: D1Database,
  comicId: number
): Promise<ApiError | undefined> {
  const comicQuery = `UPDATE comic SET publishStatus = 'pending' WHERE id = ?`;
  const metadataQuery =
    'UPDATE comicmetadata SET publishDate = NULL, scheduleModId = NULL, publishingQueuePos = NULL WHERE comicId = ?';

  const dbRes = await queryDbMultiple(db, [
    {
      query: comicQuery,
      params: [comicId],
      queryName: 'Unschedule comic',
    },
    {
      query: metadataQuery,
      params: [comicId],
      queryName: 'Unschedule comic metadata',
    },
  ]);

  const logCtx = { comicId };

  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error updating comic+metadata in unScheduleComic', logCtx);
  }

  recalculatePublishingQueue(db); // Can run in background
}
