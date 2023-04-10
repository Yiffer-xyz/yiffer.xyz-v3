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

  const err = await rejectComic(urlBase, parseInt(formComicId.toString()));

  if (err) {
    logErrorOLD_DONOTUSE(
      `Error in /reject-pending-comic for comic id ${formComicId.toString()}`,
      err
    );
    return create500Json(err.client400Message);
  }

  return createSuccessJson();
}

export async function rejectComic(
  urlBase: string,
  comicId: number
): Promise<ApiError | undefined> {
  const updateActionQuery = `UPDATE comic SET publishStatus = 'rejected' WHERE id = ?`;
  const dbRes = await queryDb(urlBase, updateActionQuery, [comicId]);
  if (dbRes.errorMessage) {
    return {
      client400Message: 'Error rejecting comic',
      logMessage: 'Error rejecting comic, could not set publishStatus rejected',
      error: dbRes,
    };
  }
}
