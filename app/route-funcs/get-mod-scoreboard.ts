import { queryDb } from '~/utils/database-facade';
import { makeDbErrObj, type ResultOrErrorPromise } from '~/utils/request-helpers';

export type ModScore = {
  userId: number;
  username: string;
  points: number;
};

export async function getModScoreboard(db: D1Database): ResultOrErrorPromise<ModScore[]> {
  const query = `SELECT userId, username, SUM(points) AS points FROM modaction
    INNER JOIN user ON (modaction.userId = user.id)
    GROUP BY userId
    ORDER BY points DESC`;

  const result = await queryDb<ModScore[]>(db, query);

  if (result.isError) {
    return makeDbErrObj(result, 'Error getting mod scoreboard');
  }

  return { result: result.result };
}
