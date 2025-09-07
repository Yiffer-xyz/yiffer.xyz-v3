import type { UserRestriction } from '~/types/types';
import { queryDb } from '~/utils/database-facade';
import { parseDbDateStr } from '~/utils/date-utils';
import { makeDbErrObj, type ResultOrErrorPromise } from '~/utils/request-helpers';

type DbUserRestriction = {
  id: number;
  userId: number;
  restrictionType: string;
  startDate: string;
  endDate: string;
};

export async function isUserRestricted(
  db: D1Database,
  userId: number,
  restriction: string
): ResultOrErrorPromise<{ isRestricted: boolean; endDate?: Date }> {
  const query = `SELECT * FROM userrestriction
    WHERE userId = ? AND restrictionType = ?
    AND endDate > CURRENT_DATE
    ORDER BY endDate DESC
    LIMIT 1`;

  const result = await queryDb<DbUserRestriction[]>(
    db,
    query,
    [userId, restriction],
    'Is user restricted'
  );

  if (result.isError) {
    return makeDbErrObj(result, 'Error getting user restriction', {
      userId,
      restriction,
    });
  }

  if (result.result.length === 0) {
    return { result: { isRestricted: false } };
  }

  return {
    result: {
      isRestricted: true,
      endDate: parseDbDateStr(result.result[0].endDate),
    },
  };
}

export async function getUserRestrictions(
  db: D1Database,
  userId: number,
  limitToActive: boolean
): ResultOrErrorPromise<UserRestriction[]> {
  const query = `SELECT id, userId, restrictionType, startDate, endDate FROM userrestriction WHERE userId = ? ORDER BY startDate ASC`;

  const dbRes = await queryDb<DbUserRestriction[]>(
    db,
    query,
    [userId],
    'Get user restrictions'
  );

  if (dbRes.isError) {
    return makeDbErrObj(dbRes, 'Error getting user restrictions', { userId });
  }

  let restrictions = dbRes.result.map(dbRestriction => ({
    id: dbRestriction.id,
    userId: dbRestriction.userId,
    restrictionType: dbRestriction.restrictionType as 'chat' | 'contribute' | 'comment',
    startDate: parseDbDateStr(dbRestriction.startDate),
    endDate: parseDbDateStr(dbRestriction.endDate),
  }));

  if (limitToActive) {
    restrictions = restrictions.filter(restriction => restriction.endDate > new Date());
  }

  return {
    result: restrictions,
  };
}
