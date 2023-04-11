import { ActionArgs } from '@remix-run/cloudflare';
import { queryDb } from '~/utils/database-facade';
import { redirectIfNotMod } from '~/utils/loaders';
import {
  ApiError,
  create500Json,
  createSuccessJson,
  logErrorOLD_DONOTUSE,
  makeDbErr,
  processApiError,
} from '~/utils/request-helpers';

export async function action(args: ActionArgs) {
  await redirectIfNotMod(args);
  const urlBase = args.context.DB_API_URL_BASE as string;

  const formDataBody = await args.request.formData();

  const formComicId = formDataBody.get('comicId');
  if (!formComicId) return new Response('Missing comicId', { status: 400 });

  const err = await rejectComic(urlBase, parseInt(formComicId.toString()));

  if (err) {
    return processApiError('Error in /reject-pending-comic', err);
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
    return makeDbErr(
      dbRes,
      'Error rejecting comic, could not set publishStatus rejected',
      { comicId }
    );
  }
}
