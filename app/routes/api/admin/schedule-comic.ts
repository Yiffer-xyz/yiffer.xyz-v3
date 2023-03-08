import { ActionArgs, json } from '@remix-run/cloudflare';
import { queryDbDirect } from '~/utils/database-facade';
import { redirectIfNotMod } from '~/utils/loaders';

export async function action(args: ActionArgs) {
  await redirectIfNotMod(args);
  const urlBase = args.context.DB_API_URL_BASE as string;

  const formDataBody = await args.request.formData();

  const formComicId = formDataBody.get('comicId');
  const formPublishDate = formDataBody.get('publishDate');

  if (!formComicId) return new Response('Missing comicId', { status: 400 });

  await scheduleComic(
    urlBase,
    parseInt(formComicId.toString()),
    formPublishDate ? formPublishDate.toString() : null
  );

  return json({ success: true });
}

export async function scheduleComic(
  urlBase: string,
  comicId: number,
  publishDate: string | null
) {
  const query = 'UPDATE unpublishedcomic SET publishDate = ? WHERE comicId = ?';
  await queryDbDirect(urlBase, query, [publishDate, comicId]);
  return;
}
