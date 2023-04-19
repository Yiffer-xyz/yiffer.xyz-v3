import { ActionArgs } from '@remix-run/cloudflare';
import { queryDb } from '~/utils/database-facade';
import { redirectIfNotMod } from '~/utils/loaders';
import {
  ApiError,
  createSuccessJson,
  makeDbErr,
  processApiError,
} from '~/utils/request-helpers';

export async function action(args: ActionArgs) {
  await redirectIfNotMod(args);
  const urlBase = args.context.DB_API_URL_BASE;

  const formDataBody = await args.request.formData();

  const formComicId = formDataBody.get('comicId');
  if (!formComicId) return new Response('Missing comicId', { status: 400 });

  const formErrorText = formDataBody.get('errorText');
  let errorText = formErrorText ? formErrorText.toString() : null;
  if (errorText === '') errorText = null;

  const err = await setComicError(urlBase, parseInt(formComicId.toString()), errorText);
  if (err) {
    return processApiError('Error in /set-comic-error', err);
  }
  return createSuccessJson();
}

export async function setComicError(
  urlBase: string,
  comicId: number,
  errorText: string | null
): Promise<ApiError | undefined> {
  const updateActionQuery = `UPDATE comicmetadata SET errorText = ? WHERE comicId = ?`;
  const updateActionQueryParams = [errorText, comicId];

  let dbRes = await queryDb(urlBase, updateActionQuery, updateActionQueryParams);
  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error updating comicmetadata', { comicId, errorText });
  }

  if (!errorText) {
    const removeModQuery =
      'UPDATE comicmetadata SET pendingProblemModId = NULL WHERE comicId = ?';
    const removeModQueryParams = [comicId];

    dbRes = await queryDb(urlBase, removeModQuery, removeModQueryParams);
    if (dbRes.isError) {
      return makeDbErr(dbRes, 'Error removing mod id', { comicId, errorText });
    }
  }
}
