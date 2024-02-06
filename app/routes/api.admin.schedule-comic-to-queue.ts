import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { queryDbMultiple } from '~/utils/database-facade';
import { redirectIfNotMod } from '~/utils/loaders';
import type { ApiError } from '~/utils/request-helpers';
import {
  create400Json,
  createSuccessJson,
  makeDbErr,
  processApiError,
  wrapApiError,
} from '~/utils/request-helpers';
import { recalculatePublishingQueue } from '~/route-funcs/publishing-queue';

export async function action(args: ActionFunctionArgs) {
  const user = await redirectIfNotMod(args);

  const formDataBody = await args.request.formData();
  const formComicId = formDataBody.get('comicId');
  if (!formComicId) return create400Json('Missing comicId');

  const err = await scheduleComic(
    args.context.DB,
    parseInt(formComicId.toString()),
    user.userId
  );
  if (err) {
    return processApiError('Error in /schedule-comic-to-queue', err);
  }
  return createSuccessJson();
}

export async function scheduleComic(
  db: D1Database,
  comicId: number,
  modId: number
): Promise<ApiError | undefined> {
  const comicQuery = `UPDATE comic SET publishStatus = 'scheduled' WHERE id = ?`;
  const metadataQuery = 'UPDATE comicmetadata SET scheduleModId = ? WHERE comicId = ?';

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
        errorLogMessage: 'Could not update metadata tabl',
      },
    ],
    'Error updating comic+metadata in scheduleComic'
  );

  const logCtx = { comicId, modId };

  if (dbRes.isError) {
    return makeDbErr(dbRes, dbRes.errorMessage, logCtx);
  }

  const err = await recalculatePublishingQueue(db);
  if (err) {
    return wrapApiError(err, 'Error scheduling, recalculating', logCtx);
  }
}
