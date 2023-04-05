import { format } from 'date-fns';
import { ContributionPointsEntry } from '~/types/types';
import { queryDb } from '~/utils/database-facade';
import { ApiError } from '~/utils/request-helpers';

export async function addContributionPoints(
  urlBase: string,
  userId: number,
  pointColumn: string
): Promise<ApiError | undefined> {
  const yearMonth = format(new Date(), 'yyyy-MM');
  const getExistingPointsForMonthQuery = `
    SELECT * FROM contributionpoints
    WHERE userId = ? AND (yearMonth = ? OR yearMonth = 'all-time')
  `;
  const getExistingPointsForMonthQueryParams = [userId, yearMonth];
  const existingDbRes = await queryDb<ContributionPointsEntry[]>(
    urlBase,
    getExistingPointsForMonthQuery,
    getExistingPointsForMonthQueryParams
  );

  if (existingDbRes.errorMessage) {
    return {
      clientMessage: 'Error adding contribution points',
      logMessage: `Error adding contribution points. User id: ${userId}, point column: ${pointColumn}, year-month: ${yearMonth}`,
      error: existingDbRes,
    };
  }

  ['all-time', yearMonth].forEach(async timeVal => {
    const existingPoints = existingDbRes.result!.filter(
      entry => entry.yearMonth === timeVal
    );

    if (existingPoints.length === 0) {
      const insertPointsQuery = `
        INSERT INTO contributionpoints (userId, yearMonth, ${pointColumn})
        VALUES (?, ?, 1)
      `;
      const insertPointsQueryParams = [userId, timeVal];
      const insertDbRes = await queryDb<ContributionPointsEntry>(
        urlBase,
        insertPointsQuery,
        insertPointsQueryParams
      );
      if (insertDbRes.errorMessage) {
        return {
          clientMessage: 'Error adding contribution points',
          logMessage: `Error adding contribution points. User id: ${userId}, point column: ${pointColumn}, year-month: ${yearMonth}`,
          error: insertDbRes,
        };
      }
    } else {
      const updatePointsQuery = `
        UPDATE contributionpoints
        SET ${pointColumn} = ${pointColumn} + 1
        WHERE userId = ? AND yearMonth = ?
      `;
      const updatePointsQueryParams = [userId, timeVal];
      const updateDbRes = await queryDb<ContributionPointsEntry>(
        urlBase,
        updatePointsQuery,
        updatePointsQueryParams
      );
      if (updateDbRes.errorMessage) {
        return {
          clientMessage: 'Error adding contribution points',
          logMessage: `Error adding contribution points. User id: ${userId}, point column: ${pointColumn}, year-month: ${yearMonth}`,
          error: updateDbRes,
        };
      }
    }
  });
}
