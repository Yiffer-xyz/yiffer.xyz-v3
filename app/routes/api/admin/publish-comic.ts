import { ActionArgs } from '@remix-run/cloudflare';
import { queryDb } from '~/utils/database-facade';
import { redirectIfNotMod } from '~/utils/loaders';
import {
  ApiError,
  create500Json,
  createSuccessJson,
  logErrorOLD_DONOTUSE,
} from '~/utils/request-helpers';

export async function action(args: ActionArgs) {
  await redirectIfNotMod(args);
  const urlBase = args.context.DB_API_URL_BASE as string;

  const formDataBody = await args.request.formData();

  const formComicId = formDataBody.get('comicId');
  if (!formComicId) return new Response('Missing comicId', { status: 400 });

  const err = await publishComic(urlBase, parseInt(formComicId.toString()));
  if (err) {
    logErrorOLD_DONOTUSE(
      `Error in /publish-comic, failed publishing comic from with id ${formComicId}`,
      err
    );
    return create500Json(err.client400Message);
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
  if (dbRes.errorMessage) {
    return {
      client400Message: 'Error publishing comic: Could not update comic table',
      logMessage: 'Error publishing comic: could not update comic table',
      error: dbRes,
    };
  }
}
