import type { ModApplication } from '~/types/types';
import { queryDb } from '~/utils/database-facade';
import type { ResultOrErrorPromise } from '~/utils/request-helpers';
import { makeDbErrObj } from '~/utils/request-helpers';

export async function getAllModApplications(
  db: D1Database
): ResultOrErrorPromise<ModApplication[]> {
  const query = `SELECT
      modapplication.id,
      userId,
      timestamp,
      telegramUsername,
      notes,
      user.username
    FROM modapplication INNER JOIN user ON (user.id = modapplication.userId)`;

  const dbRes = await queryDb<ModApplication[]>(db, query);
  if (dbRes.isError) {
    return makeDbErrObj(dbRes, 'Error getting mod applications');
  }

  return { result: dbRes.result };
}

export async function getModApplicationForUser(
  db: D1Database,
  userId: number
): ResultOrErrorPromise<ModApplication | null> {
  const query = `SELECT
      modapplication.id,
      userId,
      timestamp,
      telegramUsername,
      notes,
      user.username
    FROM modapplication INNER JOIN user ON (user.id = modapplication.userId)
    WHERE UserId = ?
    LIMIT 1`;

  const queryParams = [userId];
  const dbRes = await queryDb<ModApplication[]>(db, query, queryParams);
  if (dbRes.isError) {
    return makeDbErrObj(dbRes, 'Error getting mod applications for user', { userId });
  }

  return { result: dbRes.result.length > 0 ? dbRes.result[0] : null };
}
