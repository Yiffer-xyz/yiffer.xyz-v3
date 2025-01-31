import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { addModLogAndPoints } from '~/route-funcs/add-mod-log-and-points';
import { queryDbExec } from '~/utils/database-facade';
import { redirectIfNotMod } from '~/utils/loaders';
import {
  create400Json,
  createSuccessJson,
  makeDbErr,
  noGetRoute,
  processApiError,
  type ApiError,
} from '~/utils/request-helpers';

export { noGetRoute as loader };

export async function action(args: ActionFunctionArgs) {
  const user = await redirectIfNotMod(args);
  const formDataBody = await args.request.formData();
  const formComicId = formDataBody.get('comicId');
  if (!formComicId) return create400Json('Missing adId');
  const comicId = parseInt(formComicId.toString());

  const err = await updateThumbnailStatus(
    args.context.cloudflare.env.DB,
    comicId,
    true,
    user.userId
  );
  if (err) {
    return processApiError('Error in /update-thumbnail-status', err, { comicId });
  }
  return createSuccessJson();
}

export async function updateThumbnailStatus(
  db: D1Database,
  comicId: number,
  hasHighRes: boolean,
  userId: number
): Promise<ApiError | undefined> {
  const query = `UPDATE comic SET hasHighresThumbnail=? WHERE id=?`;
  const params = [hasHighRes ? 1 : 0, comicId];

  const dbRes = await queryDbExec(db, query, params, 'Comic highres thumbnail update');
  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error updating comic highres thumbnail status');
  }

  const modLogErr = await addModLogAndPoints({
    db,
    userId,
    comicId,
    actionType: 'comic-thumbnail-changed',
  });
  if (modLogErr) {
    return processApiError('Error in /update-thumbnail-status', modLogErr);
  }
}
