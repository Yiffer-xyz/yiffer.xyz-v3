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

export async function action(args: ActionArgs) {
  await redirectIfNotMod(args);
  const urlBase = args.context.DB_API_URL_BASE as string;

  const formDataBody = await args.request.formData();

  const formComicId = formDataBody.get('comicId');
  if (!formComicId) return create400Json('Missing comicId');

  const err = await relistComic(urlBase, parseInt(formComicId.toString()));
  if (err) {
    logError('Error relisting comic', err);
    return create500Json(err.clientMessage);
  }

  return createSuccessJson();
}

export async function relistComic(
  urlBase: string,
  comicId: number
): Promise<ApiError | undefined> {
  const comicQuery = `UPDATE comic SET publishStatus = 'published' WHERE id = ?`;
  const unpublishedQuery =
    'UPDATE unpublishedcomic SET unlistComment = NULL WHERE comicId = ?';

  const [comicDbRes, unpublishedDbRes] = await Promise.all([
    queryDb(urlBase, comicQuery, [comicId]),
    queryDb(urlBase, unpublishedQuery, [comicId]),
  ]);

  if (comicDbRes.errorMessage) {
    return {
      clientMessage: 'Error relisting comic',
      logMessage: `Error relisting comic with id ${comicId}. Could not update comic table.`,
      error: comicDbRes,
    };
  }
  if (unpublishedDbRes.errorMessage) {
    return {
      clientMessage: 'Error relisting comic',
      logMessage: `Error relisting comic with id ${comicId}. Could not update unpublishedcomic table.`,
      error: comicDbRes,
    };
  }
}
