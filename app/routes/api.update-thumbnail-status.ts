import { unstable_defineAction } from '@remix-run/cloudflare';
import { queryDbExec } from '~/utils/database-facade';
import {
  create400Json,
  createSuccessJson,
  makeDbErr,
  noGetRoute,
  processApiError,
  type ApiError,
} from '~/utils/request-helpers';

export { noGetRoute as loader };

export const action = unstable_defineAction(async args => {
  const formDataBody = await args.request.formData();
  const formComicId = formDataBody.get('comicId');
  if (!formComicId) return create400Json('Missing adId');
  const comicId = parseInt(formComicId.toString());

  const err = await updateThumbnailStatus(args.context.cloudflare.env.DB, comicId, true);
  if (err) {
    return processApiError('Error in /update-thumbnail-status', err, { comicId });
  }
  return createSuccessJson();
});

export async function updateThumbnailStatus(
  db: D1Database,
  comicId: number,
  hasHighRes: boolean
): Promise<ApiError | undefined> {
  const query = `UPDATE comic SET hasHighresThumbnail=? WHERE id=?`;
  const params = [hasHighRes ? 1 : 0, comicId];

  const dbRes = await queryDbExec(db, query, params);
  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error updating comic highres thumbnail status');
  }
}
