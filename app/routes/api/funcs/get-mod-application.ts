import { ModApplication } from '~/types/types';
import { queryDbDirect } from '~/utils/database-facade';

export async function getModApplicationForUser(urlBase: string, userId: number) {
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
  const modApplicaiton = await queryDbDirect<ModApplication[]>(
    urlBase,
    query,
    queryParams
  );

  return modApplicaiton.length > 0 ? modApplicaiton[0] : null;
}
