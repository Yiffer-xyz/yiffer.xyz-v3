import type { User } from '~/types/types';
import { queryDb } from '~/utils/database-facade';
import type { ResultOrErrorPromise } from '~/utils/request-helpers';
import { makeDbErrObj } from '~/utils/request-helpers';

export async function searchUsers(
  urlBase: string,
  searchText: string
): ResultOrErrorPromise<User[]> {
  const searchQuery = `
    SELECT id, username, email, userType, createdTime, isBanned, banReason, modNotes
    FROM user
    WHERE username LIKE ? OR email LIKE ?
  `;

  const dbRes = await queryDb<User[]>(urlBase, searchQuery, [
    `%${searchText}%`,
    `%${searchText}%`,
  ]);
  if (dbRes.isError || !dbRes.result) {
    return makeDbErrObj(dbRes, 'Error in user search', { searchText });
  }

  const users: User[] = dbRes.result.map(user => ({
    ...user,
    isBanned: !!user.isBanned, // Hack; it's 0|1 in db
  }));

  return { result: users };
}

export async function getUserById(
  urlBase: string,
  userId: number
): ResultOrErrorPromise<User> {
  const userQuery = `
    SELECT id, username, email, userType, createdTime, isBanned, banReason, modNotes
    FROM user
    WHERE id = ?
  `;

  const dbRes = await queryDb<User[]>(urlBase, userQuery, [userId]);
  if (dbRes.isError || !dbRes.result || dbRes.result.length === 0) {
    return makeDbErrObj(dbRes, 'Error getting user', { userId });
  }

  const user = dbRes.result[0];
  user.isBanned = !!user.isBanned; // Hack; it's 0|1 in db

  return { result: user };
}
