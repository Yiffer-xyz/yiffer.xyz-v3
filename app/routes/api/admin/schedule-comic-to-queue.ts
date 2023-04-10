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
  if (err) return create500Json(err.client400Message);

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

  if (comicDbRes.errorMessage) {
    return {
      client400Message: 'Error scheduling comic',
      logMessage: `Error scheduling comic with id ${comicId}. Could not update comic table.`,
      error: comicDbRes,
    };
  }
  if (metadataDbRes.errorMessage) {
    return {
      client400Message: 'Error scheduling comic',
      logMessage: `Error scheduling comic with id ${comicId}. Could not update comicmetadata table.`,
      error: comicDbRes,
    };
  }

  const err = await recalculatePublishingQueue(urlBase);
  return err;
}
