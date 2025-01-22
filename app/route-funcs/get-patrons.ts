import type { Patron } from '~/types/types';
import { queryDb } from '~/utils/database-facade';
import type { ResultOrErrorPromise } from '~/utils/request-helpers';
import { makeDbErrObj } from '~/utils/request-helpers';

export async function getPatrons(db: D1Database): ResultOrErrorPromise<Patron[]> {
  const patronQuery = `
    SELECT id AS userId, username, patreonDollars, patreonEmail, email as userEmail
    FROM user
    WHERE patreonDollars IS NOT NULL
    ORDER BY patreonDollars DESC
  `;

  const dbRes = await queryDb<Patron[]>(db, patronQuery, null, 'Active patrons');
  if (dbRes.isError || !dbRes.result) {
    return makeDbErrObj(dbRes, 'Error getting active patrons');
  }

  const patrons = dbRes.result;
  return { result: patrons };
}
