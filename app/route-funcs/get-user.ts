import type { User } from '~/types/types';
import { queryDb } from '~/utils/database-facade';
import { parseDbDateStr } from '~/utils/date-utils';
import type {
  ResultOrErrorPromise,
  ResultOrNotFoundOrErrorPromise,
} from '~/utils/request-helpers';
import { makeDbErrObj } from '~/utils/request-helpers';

type DbUser = Omit<
  User,
  'createdTime' | 'banTime' | 'lastActionTime' | 'isBanned' | 'hasCompletedConversion'
> & {
  createdTime: string;
  banTime: string;
  lastActionTime: string;
  isBanned: 0 | 1;
  hasCompletedConversion: 0 | 1;
};

export async function searchUsers(
  db: D1Database,
  searchText: string
): ResultOrErrorPromise<User[]> {
  const whereQuery = searchText.length > 0 ? 'WHERE username LIKE ? OR email LIKE ?' : '';
  const params = searchText.length > 0 ? [`%${searchText}%`, `%${searchText}%`] : [];

  const searchQuery = `
    SELECT id, username, email, userType, createdTime, isBanned, banReason,
      banTimestamp AS banTime, lastActionTimestamp AS lastActionTime, modNotes,
      hasCompletedConversion, patreonEmail, patreonDollars
    FROM user
    ${whereQuery}
    ORDER BY lastActionTimestamp DESC, createdTime DESC
    LIMIT 50
  `;

  const dbRes = await queryDb<DbUser[]>(db, searchQuery, params, 'User search');
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
      banTimestamp AS banTime, lastActionTimestamp AS lastActionTime, modNotes, hasCompletedConversion,
      patreonEmail, patreonDollars
    FROM user
    WHERE id = ?
    LIMIT 1
  `;

  const dbRes = await queryDb<DbUser[]>(db, userQuery, [userId], 'User by ID');
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
      banTimestamp AS banTime, lastActionTimestamp AS lastActionTime, hasCompletedConversion,
      patreonEmail, patreonDollars
    FROM user
    WHERE email = ? COLLATE NOCASE
    LIMIT 1
  `;

  const dbRes = await queryDb<DbUser[]>(db, userQuery, [email], 'User by email');
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
    hasCompletedConversion: !!user.hasCompletedConversion,
  };
}

export async function getUsersByPatreonEmails(
  db: D1Database,
  emails: string[]
): ResultOrErrorPromise<{ patreonEmail: string; id: number }[]> {
  const userQuery = `
    SELECT id, patreonEmail FROM user WHERE patreonEmail IN (${emails.map(() => '?').join(',')})
  `;

  const dbRes = await queryDb<{ id: number; patreonEmail: string }[]>(
    db,
    userQuery,
    emails,
    'User IDs by Patreon emails'
  );
  if (dbRes.isError || !dbRes.result) {
    return makeDbErrObj(dbRes, 'Error getting user IDs by Patreon emails', { emails });
  }

  return { result: dbRes.result };
}
