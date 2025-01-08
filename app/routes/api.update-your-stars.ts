import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { getAndCacheComicsPaginated } from '~/route-funcs/get-and-cache-comicspaginated';
import { queryDbExec } from '~/utils/database-facade';
import { redirectIfNotLoggedIn } from '~/utils/loaders';
import type { ApiError, noGetRoute } from '~/utils/request-helpers';
import {
  create400Json,
  createSuccessJson,
  makeDbErr,
  processApiError,
  wrapApiError,
} from '~/utils/request-helpers';

export { noGetRoute as loader };

export async function action(args: ActionFunctionArgs) {
  const user = await redirectIfNotLoggedIn(args);

  const formDataBody = await args.request.formData();

  const formStars = formDataBody.get('stars');
  if (!formStars) return create400Json('Missing stars number');
  const stars = parseInt(formStars.toString());
  if (isNaN(stars)) return create400Json('Invalid stars number');

  const formComicId = formDataBody.get('comicId');
  if (!formComicId) return create400Json('Missing comicId');
  const comicId = parseInt(formComicId.toString());
  if (isNaN(comicId)) return create400Json('Invalid comicId');

  const err = await updateStarRating(
    args.context.cloudflare.env.DB,
    user.userId,
    comicId,
    stars
  );
  if (err) {
    return processApiError('Error in /update-your-stars', err);
  }
  return createSuccessJson();
}

export async function updateStarRating(
  db: D1Database,
  userId: number,
  comicId: number,
  stars: number
): Promise<ApiError | undefined> {
  const logCtx = { userId, comicId, stars };

  if (stars === 0) {
    const deleteQuery = 'DELETE from comicrating WHERE userId = ? AND comicId = ?';
    const dbRes = await queryDbExec(db, deleteQuery, [userId, comicId], 'Rating delete');
    if (dbRes.isError) {
      return makeDbErr(dbRes, 'Error deleting rating', logCtx);
    }
  } else {
    const upsertQuery = `
    INSERT INTO comicrating (userId, comicId, rating) VALUES (?, ?, ?)
    ON CONFLICT (userId, comicId) DO UPDATE SET rating = ?
  `;
    const queryParams = [userId, comicId, stars, stars];

    const dbRes = await queryDbExec(db, upsertQuery, queryParams, 'Rating upsert');
    if (dbRes.isError) {
      return makeDbErr(dbRes, 'Error upserting comic rating', logCtx);
    }
  }

  const res = await getAndCacheComicsPaginated({
    db,
    includeAds: false,
    pageNum: 1,
  });
  if (res.err) return wrapApiError(res.err, 'Error in updateStarRating', logCtx);
}
