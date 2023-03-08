import { ActionArgs, json } from '@remix-run/cloudflare';
import { queryDbDirect } from '~/utils/database-facade';
import { redirectIfNotMod } from '~/utils/loaders';

export async function action(args: ActionArgs) {
  await redirectIfNotMod(args);
  const urlBase = args.context.DB_API_URL_BASE as string;

  const formDataBody = await args.request.formData();

  const formComicId = formDataBody.get('comicId');
  if (!formComicId) return new Response('Missing comicId', { status: 400 });

  const formErrorText = formDataBody.get('errorText');
  let errorText = formErrorText ? formErrorText.toString() : null;
  if (errorText === '') errorText = null;

  await setComicError(urlBase, parseInt(formComicId.toString()), errorText);

  return json({ success: true });
}

export async function setComicError(
  urlBase: string,
  comicId: number,
  errorText: string | null
) {
  const updateActionQuery = `UPDATE unpublishedcomic SET errorText = ? WHERE comicId = ?`;
  const updateActionQueryParams = [errorText, comicId];

  await queryDbDirect(urlBase, updateActionQuery, updateActionQueryParams);

  return;
}
