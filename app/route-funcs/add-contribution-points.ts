import { format } from 'date-fns';
import { queryDb, queryDbExec } from '~/utils/database-facade';
import type { ApiError } from '~/utils/request-helpers';
import { makeDbErr } from '~/utils/request-helpers';

export async function addContributionPoints(
  db: D1Database,
  userId: number | null | undefined,
  pointColumn: string,
  numberOfPoints = 1
): Promise<ApiError | undefined> {
  if (!userId) return;

  const yearMonth = format(new Date(), 'yyyy-MM');
  const logCtx = { userId, pointColumn, yearMonth };

  const getExistingPointsForMonthQuery = `
    SELECT yearMonth FROM contributionpoints
    WHERE userId = ? AND (yearMonth = ? OR yearMonth = 'all-time')
  `;
  const getExistingPointsForMonthQueryParams = [userId, yearMonth];
  const existingDbRes = await queryDb<{ yearMonth: string }[]>(
    db,
    getExistingPointsForMonthQuery,
    getExistingPointsForMonthQueryParams
  );

  if (existingDbRes.isError) {
    return makeDbErr(existingDbRes, 'Error adding contribution points', logCtx);
  }

  ['all-time', yearMonth].forEach(async timeVal => {
    const existingPoints = existingDbRes.result.filter(
      entry => entry.yearMonth === timeVal
    );

    if (existingPoints.length === 0) {
      const insertPointsQuery = `
        INSERT INTO contributionpoints (userId, yearMonth, ${pointColumn})
        VALUES (?, ?, ?)
      `;
      const insertPointsQueryParams = [userId, timeVal, numberOfPoints];
      const insertDbRes = await queryDbExec(
        db,
        insertPointsQuery,
        insertPointsQueryParams
      );
      if (insertDbRes.isError) {
        return makeDbErr(insertDbRes, 'Error adding contribution points', logCtx);
      }
    } else {
      const updatePointsQuery = `
        UPDATE contributionpoints
        SET ${pointColumn} = ${pointColumn} + ${numberOfPoints}
        WHERE userId = ? AND yearMonth = ?
      `;
      const updatePointsQueryParams = [userId, timeVal];
      const updateDbRes = await queryDbExec(
        db,
        updatePointsQuery,
        updatePointsQueryParams
      );
      if (updateDbRes.isError) {
        return makeDbErr(updateDbRes, 'Error updating contribution points', logCtx);
      }
    }
  });
}
