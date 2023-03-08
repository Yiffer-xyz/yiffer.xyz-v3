import { ActionArgs, json } from '@remix-run/cloudflare';
import { queryDbDirect } from '~/utils/database-facade';
import { redirectIfNotMod } from '~/utils/loaders';

export async function action(args: ActionArgs) {
  await redirectIfNotMod(args);
  const urlBase = args.context.DB_API_URL_BASE as string;

  const formDataBody = await args.request.formData();

  const formComicId = formDataBody.get('comicId');
  if (!formComicId) return new Response('Missing comicId', { status: 400 });

  await rejectComic(urlBase, parseInt(formComicId.toString()));

  return json({ success: true });
}

export async function rejectComic(urlBase: string, comicId: number) {
  const updateActionQuery = `UPDATE comic SET publishStatus = 'rejected' WHERE id = ?`;
  await queryDbDirect(urlBase, updateActionQuery, [comicId]);
  return;
}
