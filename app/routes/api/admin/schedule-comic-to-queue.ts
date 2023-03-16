import { ActionArgs } from '@remix-run/cloudflare';
import { queryDb } from '~/utils/database-facade';
import { redirectIfNotMod } from '~/utils/loaders';
import {
  ApiError,
  create400Json,
  create500Json,
  createSuccessJson,
} from '~/utils/request-helpers';
import { recalculatePublishingQueue } from '../funcs/publishing-queue';

export async function action(args: ActionArgs) {
  const user = await redirectIfNotMod(args);
  const urlBase = args.context.DB_API_URL_BASE as string;

  const formDataBody = await args.request.formData();
  const formComicId = formDataBody.get('comicId');
  if (!formComicId) return create400Json('Missing comicId');

  const err = await scheduleComic(urlBase, parseInt(formComicId.toString()), user.userId);
  if (err) return create500Json(err.clientMessage);

  return createSuccessJson();
}

export async function scheduleComic(
  urlBase: string,
  comicId: number,
  modId: number
): Promise<ApiError | undefined> {
  const unpublishedQuery =
    'UPDATE unpublishedcomic SET scheduleModId = ? WHERE comicId = ?';
  const comicQuery = `UPDATE comic SET publishStatus = 'scheduled' WHERE id = ?`;

  const [comicDbRes, unpublishedDbRes] = await Promise.all([
    queryDb(urlBase, comicQuery, [comicId]),
    queryDb(urlBase, unpublishedQuery, [modId, comicId]),
  ]);

  if (comicDbRes.errorMessage) {
    return {
      clientMessage: 'Error scheduling comic',
      logMessage: `Error scheduling comic with id ${comicId}. Could not update comic table.`,
      error: comicDbRes,
    };
  }
  if (unpublishedDbRes.errorMessage) {
    return {
      clientMessage: 'Error scheduling comic',
      logMessage: `Error scheduling comic with id ${comicId}. Could not update unpublishedcomic table.`,
      error: comicDbRes,
    };
  }

  const err = await recalculatePublishingQueue(urlBase);
  return err;
}
