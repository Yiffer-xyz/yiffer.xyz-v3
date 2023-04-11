import { ModApplication } from '~/types/types';
import { queryDb } from '~/utils/database-facade';
import { ApiError, makeDbErrObj } from '~/utils/request-helpers';

export async function getModApplicationForUser(
  urlBase: string,
  userId: number
): Promise<{
  err?: ApiError;
  application?: ModApplication | null;
}> {
  let query = `SELECT
      modapplication.id,
      userId,
      timestamp,
      telegramUsername,
      notes,
      user.username
    FROM modapplication INNER JOIN user ON (user.id = modapplication.userId)
    WHERE UserId = ?`;

  let queryParams = [userId];
  const dbRes = await queryDb<ModApplication[]>(urlBase, query, queryParams);
  if (dbRes.errorMessage || !dbRes.result) {
    return makeDbErrObj(dbRes, 'Error getting mod applications for user', { userId });
  }

  return { application: dbRes.result.length > 0 ? dbRes.result[0] : null };
}
