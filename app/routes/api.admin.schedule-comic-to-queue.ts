import { queryDbMultiple } from '~/utils/database-facade';
import { redirectIfNotMod } from '~/utils/loaders';
import type { ApiError, noGetRoute } from '~/utils/request-helpers';
import {
  create400Json,
  createSuccessJson,
  makeDbErr,
  processApiError,
  wrapApiError,
} from '~/utils/request-helpers';
import { recalculatePublishingQueue } from '~/route-funcs/publishing-queue';
import type { ActionFunctionArgs } from '@remix-run/cloudflare';

export { noGetRoute as loader };

export async function action(args: ActionFunctionArgs) {
  const user = await redirectIfNotMod(args);

  const formDataBody = await args.request.formData();
  const formComicId = formDataBody.get('comicId');
  if (!formComicId) return create400Json('Missing comicId');

  const err = await scheduleComicToQueue(
    args.context.cloudflare.env.DB,
    parseInt(formComicId.toString()),
    user.userId
  );
  if (err) {
    return processApiError('Error in /schedule-comic-to-queue', err);
  }
  return createSuccessJson();
}

export async function scheduleComicToQueue(
  db: D1Database,
  comicId: number,
  modId: number
): Promise<ApiError | undefined> {
  const comicQuery = `UPDATE comic SET publishStatus = 'scheduled' WHERE id = ?`;
  const metadataQuery = 'UPDATE comicmetadata SET scheduleModId = ? WHERE comicId = ?';

  const dbRes = await queryDbMultiple(db, [
    {
      query: comicQuery,
      params: [comicId],
    },
    {
      query: metadataQuery,
      params: [modId, comicId],
    },
  ]);

  const logCtx = { comicId, modId };

  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error updating comic+metadata in scheduleComic', logCtx);
  }

  const err = await recalculatePublishingQueue(db);
  if (err) {
    return wrapApiError(err, 'Error scheduling, recalculating', logCtx);
  }
}
