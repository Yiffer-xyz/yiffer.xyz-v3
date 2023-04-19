import { ActionArgs } from '@remix-run/cloudflare';
import { queryDb } from '~/utils/database-facade';
import { redirectIfNotMod } from '~/utils/loaders';
import {
  ApiError,
  create400Json,
  createSuccessJson,
  makeDbErr,
  processApiError,
} from '~/utils/request-helpers';

export async function action(args: ActionArgs) {
  await redirectIfNotMod(args);
  const urlBase = args.context.DB_API_URL_BASE;

  const formDataBody = await args.request.formData();

  const formComicId = formDataBody.get('comicId');
  if (!formComicId) return create400Json('Missing comicId');

  const err = await publishComic(urlBase, parseInt(formComicId.toString()));
  if (err) {
    return processApiError('Error in /publish-comic', err, {
      comicId: formComicId,
    });
  }
  return createSuccessJson();
}

export async function publishComic(
  urlBase: string,
  comicId: number
): Promise<ApiError | undefined> {
  const query = `
    UPDATE comic
    SET publishStatus = "published",
      published = NOW(),
      updated = NOW()
    WHERE id = ?
  `;
  const dbRes = await queryDb(urlBase, query, [comicId]);
  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error publishing comic', { comicId });
  }
}
