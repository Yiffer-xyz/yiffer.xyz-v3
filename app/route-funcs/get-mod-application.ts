import type { ModApplication } from '~/types/types';
import { queryDb } from '~/utils/database-facade';
import { parseDbDateStr } from '~/utils/date-utils';
import type { ResultOrErrorPromise } from '~/utils/request-helpers';
import { makeDbErrObj } from '~/utils/request-helpers';

type DbModApplication = Omit<ModApplication, 'timestamp'> & {
  timestamp: string;
};

export async function getAllModApplications(
  db: D1Database
): ResultOrErrorPromise<ModApplication[]> {
  const query = `SELECT
      modapplication.id,
      userId,
      timestamp,
      telegramUsername,
      notes,
      user.username,
      status
    FROM modapplication INNER JOIN user ON (user.id = modapplication.userId)`;

  const dbRes = await queryDb<DbModApplication[]>(db, query, null, 'Mod applications');
  if (dbRes.isError) {
    return makeDbErrObj(dbRes, 'Error getting mod applications');
  }

  const applications = dbRes.result.map(app => ({
    ...app,
    timestamp: parseDbDateStr(app.timestamp),
  }));

  return { result: applications };
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
  const dbRes = await queryDb<DbModApplication[]>(
    db,
    query,
    queryParams,
    'Mod application for user'
  );
  if (dbRes.isError) {
    return makeDbErrObj(dbRes, 'Error getting mod applications for user', { userId });
  }

  const applicationOrNull =
    dbRes.result.length > 0
      ? { ...dbRes.result[0], timestamp: parseDbDateStr(dbRes.result[0].timestamp) }
      : null;

  return { result: applicationOrNull };
}
