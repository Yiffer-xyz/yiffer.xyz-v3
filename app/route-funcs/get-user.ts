import type { User } from '~/types/types';
import { queryDb } from '~/utils/database-facade';
import { parseDbDateStr } from '~/utils/date-utils';
import type {
  ResultOrErrorPromise,
  ResultOrNotFoundOrErrorPromise,
} from '~/utils/request-helpers';
import { makeDbErrObj } from '~/utils/request-helpers';

type DbUser = Omit<User, 'createdTime' | 'banTime' | 'lastActionTime' | 'isBanned'> & {
  createdTime: string;
  banTime: string;
  lastActionTime: string;
  isBanned: 0 | 1;
};

export async function searchUsers(
  db: D1Database,
  searchText: string
): ResultOrErrorPromise<User[]> {
  const searchQuery = `
    SELECT id, username, email, userType, createdTime, isBanned, banReason,
      banTimestamp AS banTime, lastActionTimestamp AS lastActionTime, modNotes
    FROM user
    WHERE username LIKE ? OR email LIKE ?
  `;

  const dbRes = await queryDb<DbUser[]>(db, searchQuery, [
    `%${searchText}%`,
    `%${searchText}%`,
  ]);
  if (dbRes.isError || !dbRes.result) {
    return makeDbErrObj(dbRes, 'Error in user search', { searchText });
  }

  const users: User[] = dbRes.result.map(dbUserToUser);
  return { result: users };
}

export async function getUserById(
  db: D1Database,
  userId: number
): ResultOrErrorPromise<User> {
  const userQuery = `
    SELECT id, username, email, userType, createdTime, isBanned, banReason, 
      banTimestamp AS banTime, lastActionTimestamp AS lastActionTime, modNotes
    FROM user
    WHERE id = ?
    LIMIT 1
  `;

  const dbRes = await queryDb<DbUser[]>(db, userQuery, [userId]);
  if (dbRes.isError || !dbRes.result || dbRes.result.length === 0) {
    return makeDbErrObj(dbRes, 'Error getting user', { userId });
  }

  const user = dbUserToUser(dbRes.result[0]);

  return { result: user };
}

export async function getUserByEmail(
  db: D1Database,
  email: string
): ResultOrNotFoundOrErrorPromise<User> {
  const userQuery = `
    SELECT id, username, email, userType, createdTime, isBanned, banReason, modNotes,
      banTimestamp AS banTime, lastActionTimestamp AS lastActionTime
    FROM user
    WHERE email = ?
    LIMIT 1
  `;

  const dbRes = await queryDb<DbUser[]>(db, userQuery, [email]);
  if (dbRes.isError || !dbRes.result) {
    return makeDbErrObj(dbRes, 'Error getting user', { email });
  }
  if (dbRes.result.length === 0) {
    return { notFound: true };
  }

  const user = dbUserToUser(dbRes.result[0]);

  return { result: user };
}

function dbUserToUser(user: DbUser): User {
  return {
    ...user,
    isBanned: !!user.isBanned,
    createdTime: parseDbDateStr(user.createdTime),
    banTime: user.banTime ? parseDbDateStr(user.banTime) : undefined,
    lastActionTime: user.lastActionTime ? parseDbDateStr(user.lastActionTime) : undefined,
  };
}
