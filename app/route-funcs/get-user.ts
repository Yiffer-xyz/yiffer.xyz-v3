import type { User } from '~/types/types';
import { queryDb } from '~/utils/database-facade';
import type {
  ResultOrErrorPromise,
  ResultOrNotFoundOrErrorPromise,
} from '~/utils/request-helpers';
import { makeDbErrObj } from '~/utils/request-helpers';

export async function searchUsers(
  db: D1Database,
  searchText: string
): ResultOrErrorPromise<User[]> {
  const searchQuery = `
    SELECT id, username, email, userType, createdTime, isBanned, banReason, modNotes
    FROM user
    WHERE username LIKE ? OR email LIKE ?
  `;

  const dbRes = await queryDb<User[]>(db, searchQuery, [
    `%${searchText}%`,
    `%${searchText}%`,
  ]);
  if (dbRes.isError || !dbRes.result) {
    return makeDbErrObj(dbRes, 'Error in user search', { searchText });
  }

  const users: User[] = dbRes.result.map(user => ({
    ...user,
    isBanned: !!user.isBanned,
  }));

  return { result: users };
}

export async function getUserById(
  db: D1Database,
  userId: number
): ResultOrErrorPromise<User> {
  const userQuery = `
    SELECT id, username, email, userType, createdTime, isBanned, banReason, modNotes
    FROM user
    WHERE id = ?
    LIMIT 1
  `;

  const dbRes = await queryDb<User[]>(db, userQuery, [userId]);
  if (dbRes.isError || !dbRes.result || dbRes.result.length === 0) {
    return makeDbErrObj(dbRes, 'Error getting user', { userId });
  }

  const user = dbRes.result[0];
  user.isBanned = !!user.isBanned;

  return { result: user };
}

export async function getUserByEmail(
  db: D1Database,
  email: string
): ResultOrNotFoundOrErrorPromise<User> {
  const userQuery = `
    SELECT id, username, email, userType, createdTime, isBanned, banReason, modNotes
    FROM user
    WHERE email = ?
    LIMIT 1
  `;

  const dbRes = await queryDb<User[]>(db, userQuery, [email]);
  if (dbRes.isError || !dbRes.result) {
    return makeDbErrObj(dbRes, 'Error getting user', { email });
  }
  if (dbRes.result.length === 0) {
    return { notFound: true };
  }

  const user = dbRes.result[0];
  user.isBanned = !!user.isBanned;

  return { result: user };
}
