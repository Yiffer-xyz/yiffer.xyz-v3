import { ActionArgs } from '@remix-run/cloudflare';
import { queryDbDirect } from '~/utils/database-facade';
import { redirectIfNotMod } from '~/utils/loaders';
import {
  create400Json,
  create500Json,
  createGeneric500Json,
  createSuccessJson,
} from '~/utils/request-helpers';

export async function action(args: ActionArgs) {
  await redirectIfNotMod(args);
  const urlBase = args.context.DB_API_URL_BASE as string;

  const formDataBody = await args.request.formData();

  const formComicId = formDataBody.get('comicId');
  if (!formComicId) return create400Json('Missing comicId');

  const formUnlistComment = formDataBody.get('unlistComment');
  if (!formUnlistComment) return create400Json('Missing comment');

  try {
    await unlistComic(
      urlBase,
      parseInt(formComicId.toString()),
      formUnlistComment.toString()
    );
  } catch (e) {
    return e instanceof Error ? create500Json(e.message) : createGeneric500Json();
  }

  return createSuccessJson();
}

export async function unlistComic(
  urlBase: string,
  comicId: number,
  unlistComment: string
) {
  const getDetailsQuery = 'SELECT comicId FROM unpublishedcomic WHERE comicId = ?';
  const comicUpdateQuery = `UPDATE comic SET publishStatus = 'unlisted' WHERE id = ?`;

  const [detailsResult, _] = await Promise.all([
    queryDbDirect<{ comicId: number }[]>(urlBase, getDetailsQuery, [comicId]),
    queryDbDirect(urlBase, comicUpdateQuery, [comicId]),
  ]);

  if (detailsResult.length === 0) {
    const insertQuery =
      'INSERT INTO unpublishedcomic (comicId, unlistComment) VALUES (?, ?)';
    await queryDbDirect(urlBase, insertQuery, [comicId, unlistComment]);
  } else {
    const updateQuery = 'UPDATE unpublishedcomic SET unlistComment = ? WHERE comicId = ?';
    await queryDbDirect(urlBase, updateQuery, [unlistComment, comicId]);
  }
}
