import type { UserBlockStatus } from '~/types/types';
import { queryDbMultiple } from '~/utils/database-facade';
import { makeDbErrObj, type ResultOrErrorPromise } from '~/utils/request-helpers';

export async function getUserBlockStatus(
  db: D1Database,
  userId: number,
  otherUserId: number
): Promise<ResultOrErrorPromise<UserBlockStatus>> {
  if (userId === otherUserId) {
    return { result: null };
  }

  const queries = [
    {
      query: `SELECT id FROM userblock WHERE blockerId = ? AND blockedUserId = ?`,
      params: [userId, otherUserId],
      queryName: 'Check if user blocked other',
    },
    {
      query: `SELECT id FROM userblock WHERE blockerId = ? AND blockedUserId = ?`,
      params: [otherUserId, userId],
      queryName: 'Check if user blocked by other',
    },
  ];

  const result = await queryDbMultiple<[{ id: number }[], { id: number }[]]>(db, queries);
  if (result.isError) {
    return makeDbErrObj(result, 'Error getting user block status', {
      userId,
      otherUserId,
    });
  }

  const [userBlockedOther, userBlockedByOther] = result.result;

  if (userBlockedOther.length > 0 && userBlockedByOther.length > 0) {
    return {
      result: 'both-blocked',
    };
  }

  if (userBlockedOther.length > 0) {
    return {
      result: 'blocked',
    };
  }

  if (userBlockedByOther.length > 0) {
    return {
      result: 'blocked-by',
    };
  }

  return {
    result: null,
  };
}
