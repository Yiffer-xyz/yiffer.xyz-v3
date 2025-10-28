import type { Route } from './+types/update-your-stars';
import { getAndCacheComicsPaginated } from '~/route-funcs/get-and-cache-comicspaginated';
import { queryDb, queryDbMultiple, type QueryWithParams } from '~/utils/database-facade';
import { redirectIfNotLoggedIn } from '~/utils/loaders';
import { type ApiError, noGetRoute } from '~/utils/request-helpers';
import {
  create400Json,
  createSuccessJson,
  makeDbErr,
  processApiError,
  wrapApiError,
} from '~/utils/request-helpers';

export { noGetRoute as loader };

export async function action(args: Route.ActionArgs) {
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

  const existingRatingQuery =
    'SELECT rating FROM comicrating WHERE userId = ? AND comicId = ?';
  const existingRatingRes = await queryDb<{ rating: number }[]>(
    db,
    existingRatingQuery,
    [userId, comicId],
    'Existing rating'
  );
  if (existingRatingRes.isError) {
    return makeDbErr(existingRatingRes, 'Error getting existing rating', logCtx);
  }

  const existingRating = existingRatingRes.result.length
    ? existingRatingRes.result[0].rating
    : null;

  const queriesWithParams: QueryWithParams[] = [];

  if (stars === 0) {
    const deleteQuery = 'DELETE from comicrating WHERE userId = ? AND comicId = ?';
    queriesWithParams.push({
      query: deleteQuery,
      params: [userId, comicId],
      queryName: 'Rating delete',
    });

    if (existingRating) {
      const updateAggregateQuery =
        'UPDATE comicratingaggregation SET numTimesStarred = numTimesStarred - 1, sumStars = sumStars - ? WHERE comicId = ?';
      queriesWithParams.push({
        query: updateAggregateQuery,
        params: [existingRating, comicId],
        queryName: 'Update rating aggregate',
      });
    }
  } else {
    const upsertQuery = `
      INSERT INTO comicrating (userId, comicId, rating) VALUES (?, ?, ?)
      ON CONFLICT (userId, comicId) DO UPDATE SET rating = ?
    `;
    queriesWithParams.push({
      query: upsertQuery,
      params: [userId, comicId, stars, stars],
      queryName: 'Rating upsert',
    });

    const starDiff = stars - (existingRating ?? 0);
    const updateAggregateQuery = `
      INSERT INTO comicratingaggregation (comicId, sumStars, numTimesStarred)
      VALUES (?, ?, 1)
      ON CONFLICT (comicId) DO UPDATE SET
        numTimesStarred = numTimesStarred + ?,
        sumStars = sumStars + ?`;
    queriesWithParams.push({
      query: updateAggregateQuery,
      params: [comicId, stars, existingRating ? 0 : 1, starDiff],
      queryName: 'Update rating aggregate',
    });
  }

  const dbRes = await queryDbMultiple(db, queriesWithParams);
  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error updating comic rating', logCtx);
  }

  const res = await getAndCacheComicsPaginated({
    db,
    includeAds: false,
    pageNum: 1,
  });
  if (res.err) return wrapApiError(res.err, 'Error in updateStarRating', logCtx);
}
