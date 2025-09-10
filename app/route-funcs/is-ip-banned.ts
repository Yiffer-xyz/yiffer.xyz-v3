import { queryDb } from '~/utils/database-facade';
import { makeDbErrObj, type ResultOrErrorPromise } from '~/utils/request-helpers';

export async function isIpBanned(
  db: D1Database,
  ip: string
): ResultOrErrorPromise<{ isBanned: boolean }> {
  const query = `SELECT COUNT(*) AS count FROM ipban WHERE ip = ?`;
  const result = await queryDb<[{ count: number }]>(db, query, [ip], 'IP ban status');
  if (result.isError) {
    return makeDbErrObj(result, 'Error getting IP ban status', { ip });
  }

  return {
    result: {
      isBanned: result.result.length && result.result[0].count > 0,
    },
  };
}
