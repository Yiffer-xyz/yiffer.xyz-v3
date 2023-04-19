import { ActionArgs } from '@remix-run/cloudflare';
import { queryDb } from '~/utils/database-facade';
import { redirectIfNotMod } from '~/utils/loaders';
import {
  ApiError,
  create400Json,
  createSuccessJson,
  makeDbErr,
  noGetRoute,
  processApiError,
} from '~/utils/request-helpers';

export { noGetRoute as loader };

export async function action(args: ActionArgs) {
  await redirectIfNotMod(args);
  const urlBase = args.context.DB_API_URL_BASE;

  const formDataBody = await args.request.formData();

  const formComicId = formDataBody.get('comicId');
  if (!formComicId) return create400Json('Missing comicId');

  const err = await relistComic(urlBase, parseInt(formComicId.toString()));
  if (err) {
    return processApiError('Error relisting comic', err);
  }
  return createSuccessJson();
}

export async function relistComic(
  urlBase: string,
  comicId: number
): Promise<ApiError | undefined> {
  const comicQuery = `UPDATE comic SET publishStatus = 'published' WHERE id = ?`;
  const metadataQuery = 'UPDATE comicmetadata SET unlistComment = NULL WHERE comicId = ?';

  const [comicDbRes, metadataDbRes] = await Promise.all([
    queryDb(urlBase, comicQuery, [comicId]),
    queryDb(urlBase, metadataQuery, [comicId]),
  ]);

  if (comicDbRes.isError) {
    return makeDbErr(comicDbRes, 'Could not update comic table', {
      comicId,
    });
  }
  if (metadataDbRes.isError) {
    return makeDbErr(comicDbRes, 'Could not update metadata table', {
      comicId,
    });
  }
}
