import { contributionPointEntryToPoints } from '~/types/contributions';
import { isModOrAdmin } from '~/types/types';
import type { UserSocialAccount, User, ContributionPointsEntry } from '~/types/types';
import { queryDb } from '~/utils/database-facade';
import { parseDbDateStr } from '~/utils/date-utils';
import type {
  ResultOrErrorPromise,
  ResultOrNotFoundOrErrorPromise,
} from '~/utils/request-helpers';
import { makeDbErrObj, wrapApiError } from '~/utils/request-helpers';

type DbUser = Omit<
  User,
  | 'createdTime'
  | 'banTime'
  | 'lastActionTime'
  | 'isBanned'
  | 'hasCompletedConversion'
  | 'socialLinks'
  | 'contributionPoints'
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

export async function getUserByField({
  db,
  field,
  value,
  includeExtraFields = false,
}: {
  db: D1Database;
  field: 'email' | 'username' | 'id';
  value: string | number;
  includeExtraFields?: boolean;
}): ResultOrNotFoundOrErrorPromise<User> {
  let whereStr = `WHERE user.${field} = ?`;
  if (field === 'email' || field === 'username') {
    whereStr += ' COLLATE NOCASE';
  }

  const userQuery = `
    SELECT user.id, username, email, userType, createdTime, isBanned, banReason, modNotes,
      banTimestamp AS banTime, lastActionTimestamp AS lastActionTime, hasCompletedConversion,
      patreonEmail, patreonDollars, bio, nationality, profilePictureToken
    FROM user
    ${whereStr}
    LIMIT 1
  `;

  const dbRes = await queryDb<DbUser[]>(db, userQuery, [value], `User by ${field}`);
  if (dbRes.isError || !dbRes.result) {
    return makeDbErrObj(dbRes, 'Error getting user', { field, value });
  }
  if (dbRes.result.length === 0 || dbRes.result[0].id === null) {
    return { notFound: true };
  }

  const user = dbUserToUser(dbRes.result[0]);

  if (includeExtraFields) {
    const extraFieldsRes = await getUserExtraFields(db, user);
    if (extraFieldsRes.err) {
      return {
        err: wrapApiError(
          extraFieldsRes.err,
          'Error getting extra fields for user by field',
          { field, value }
        ),
      };
    }
    user.contributionPoints = extraFieldsRes.result.contributionPoints;
    user.socialLinks = extraFieldsRes.result.socialLinks;
  }

  return { result: user };
}

function dbUserToUser(user: DbUser): User {
  const convertedUser: User = {
    ...user,
    isBanned: !!user.isBanned,
    createdTime: parseDbDateStr(user.createdTime),
    banTime: user.banTime ? parseDbDateStr(user.banTime) : undefined,
    lastActionTime: user.lastActionTime ? parseDbDateStr(user.lastActionTime) : undefined,
    hasCompletedConversion: !!user.hasCompletedConversion,
    socialLinks: [],
    contributionPoints: 0,
  };

  return convertedUser;
}

async function getUserExtraFields(
  db: D1Database,
  user: User
): ResultOrErrorPromise<{
  contributionPoints: number;
  socialLinks: UserSocialAccount[];
}> {
  const socialLinksQuery =
    'SELECT id, username, platform FROM usersocialaccount WHERE userId = ?';
  const socialLinksPromise = queryDb<UserSocialAccount[]>(
    db,
    socialLinksQuery,
    [user.id],
    'Social links'
  );

  if (isModOrAdmin(user)) {
    const modActionQuery = `SELECT SUM(points) AS points FROM modaction WHERE userId = ?`;
    const modActionPromise = queryDb<{ points: number }[]>(
      db,
      modActionQuery,
      [user.id],
      `Mod action points`
    );

    const [socialLinksRes, modActionRes] = await Promise.all([
      socialLinksPromise,
      modActionPromise,
    ]);

    if (modActionRes.isError) {
      return makeDbErrObj(modActionRes, 'Error getting mod action points', {
        userId: user.id,
      });
    } else if (socialLinksRes.isError) {
      return makeDbErrObj(socialLinksRes, 'Error getting social links', {
        userId: user.id,
      });
    }

    return {
      result: {
        contributionPoints: modActionRes.result[0].points ?? 0,
        socialLinks: socialLinksRes.result ?? [],
      },
    };
  } else {
    const contribPointsQuery =
      "SELECT * FROM contributionpoints WHERE userId = ? AND yearMonth = 'all-time'";

    const contribPointsPromise = queryDb<ContributionPointsEntry[]>(
      db,
      contribPointsQuery,
      [user.id],
      `Contribution points for user`
    );

    const [contribPointsRes, socialLinksRes] = await Promise.all([
      contribPointsPromise,
      socialLinksPromise,
    ]);

    if (contribPointsRes.isError) {
      return makeDbErrObj(contribPointsRes, 'Error getting contribution points', {
        userId: user.id,
      });
    } else if (socialLinksRes.isError) {
      return makeDbErrObj(socialLinksRes, 'Error getting social links', {
        userId: user.id,
      });
    }

    let contributionPoints = 0;
    for (const contribPointEntry of contribPointsRes.result) {
      contributionPoints += contributionPointEntryToPoints(contribPointEntry);
    }

    return {
      result: {
        contributionPoints,
        socialLinks: socialLinksRes.result,
      },
    };
  }
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
