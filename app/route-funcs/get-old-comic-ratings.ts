import { queryDb } from '~/utils/database-facade';
import type { ResultOrErrorPromise } from '~/utils/request-helpers';
import { makeDbErrObj, wrapApiError } from '~/utils/request-helpers';
import { getUserById } from './get-user';

type RatingCount = {
  rating: number;
  count: number;
};

type ComicIdWithRating = {
  comicId: number;
  rating: number;
};

export async function getOldComicRatingSummary(
  db: D1Database,
  userId?: number
): ResultOrErrorPromise<RatingCount[]> {
  if (!userId) {
    return { result: [] as RatingCount[] };
  }

  const userQuery = await getUserById(db, userId);

  if (userQuery.err) {
    return { err: wrapApiError(userQuery.err, 'Could not get user', { userId }) };
  }

  if (userQuery.result.hasCompletedConversion) {
    return { result: [] as RatingCount[] };
  }

  const query =
    'SELECT rating, COUNT(*) as count FROM oldcomicrating WHERE userId = ? GROUP BY rating ORDER BY rating DESC';
  const dbRes = await queryDb<RatingCount[]>(db, query, [userId]);

  if (dbRes.isError) {
    return makeDbErrObj(dbRes, 'Could not get old comic ratings', { userId });
  }

  return { result: dbRes.result };
}

export async function getAllOldComicRatingsForUser(
  db: D1Database,
  userId: number
): ResultOrErrorPromise<ComicIdWithRating[]> {
  const query = 'SELECT comicId, rating FROM oldcomicrating WHERE userId = ?';
  const dbRes = await queryDb<ComicIdWithRating[]>(db, query, [userId]);

  if (dbRes.isError) {
    return makeDbErrObj(dbRes, 'Could not get all old comic ratings');
  }

  return { result: dbRes.result };
}
