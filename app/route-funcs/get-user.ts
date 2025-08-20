import { contributionPointEntryToPoints } from '~/types/contributions';
import { isModOrAdmin } from '~/types/types';
import type {
  UserSocialAccount,
  User,
  ContributionPointsEntry,
  ComicComment,
} from '~/types/types';
import { mergeCommentsAndVotes } from '~/utils/comment-utils';
import type { DbComment, DbCommentVote } from '~/utils/comment-utils';
import { queryDb } from '~/utils/database-facade';
import { parseDbDateStr } from '~/utils/date-utils';
import type {
  ResultOrErrorPromise,
  ResultOrNotFoundOrErrorPromise,
} from '~/utils/request-helpers';
import { makeDbErrObj, wrapApiError } from '~/utils/request-helpers';
import { getUserBlockStatus } from './get-user-block-status';

type DbUser = Omit<
  User,
  | 'createdTime'
  | 'banTime'
  | 'lastActionTime'
  | 'isBanned'
  | 'hasCompletedConversion'
  | 'socialLinks'
  | 'contributionPoints'
  | 'allowMessages'
> & {
  createdTime: string;
  banTime: string;
  lastActionTime: string;
  isBanned: 0 | 1;
  hasCompletedConversion: 0 | 1;
  allowMessages: 0 | 1;
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
      hasCompletedConversion, patreonEmail, patreonDollars, allowMessages
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
  includeComments = false,
  includeCurrentUserFields = false,
  currentUserId,
}: {
  db: D1Database;
  field: 'email' | 'username' | 'id';
  value: string | number;
  includeExtraFields?: boolean;
  includeComments?: boolean;
  includeCurrentUserFields?: boolean;
  currentUserId?: number;
}): ResultOrNotFoundOrErrorPromise<User> {
  let whereStr = `WHERE user.${field} = ?`;
  if (field === 'email' || field === 'username') {
    whereStr += ' COLLATE NOCASE';
  }

  const userQuery = `
    SELECT user.id, username, email, userType, createdTime, isBanned, banReason, modNotes,
      banTimestamp AS banTime, lastActionTimestamp AS lastActionTime, hasCompletedConversion,
      patreonEmail, patreonDollars, bio, nationality, profilePictureToken, allowMessages
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
    const extraFieldsRes = await getUserExtraFields(
      db,
      user,
      includeComments,
      currentUserId
    );
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
    user.comments = extraFieldsRes.result.comments;
  }

  if (includeCurrentUserFields && currentUserId) {
    const chatStatusRes = await getChatsWithCurrentUser(db, user.id, currentUserId);
    if (chatStatusRes.err) {
      return {
        err: wrapApiError(
          chatStatusRes.err,
          'Error getting chat status with current user',
          { userId: user.id, currentUserId }
        ),
      };
    }
    user.chatTokenWithCurrentUser = chatStatusRes.result;

    const blockStatus = await getUserBlockStatus(db, currentUserId, user.id);
    if (blockStatus.err) {
      return {
        err: wrapApiError(
          blockStatus.err,
          'Error getting block status with current user',
          { userId: user.id, currentUserId }
        ),
      };
    }
    user.currentUserBlockStatus = blockStatus.result;
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
    allowMessages: !!user.allowMessages,
  };

  return convertedUser;
}

async function getChatsWithCurrentUser(
  db: D1Database,
  userId: number,
  currentUserId: number
): ResultOrErrorPromise<string | null> {
  const chatQuery = `
    SELECT chat.token FROM chat
    INNER JOIN chatmember cm1 ON chat.token = cm1.chatToken
    INNER JOIN chatmember cm2 ON chat.token = cm2.chatToken
    WHERE cm1.userId = ? AND cm2.userId = ? AND chat.isSystemChat = 0
    LIMIT 1`;

  const chatRes = await queryDb<{ token: string }[]>(
    db,
    chatQuery,
    [userId, currentUserId],
    'Chat with current user'
  );

  if (chatRes.isError) {
    return makeDbErrObj(chatRes, 'Error getting chat with current user', {
      userId,
      currentUserId,
    });
  }

  const token = chatRes.result.length > 0 ? chatRes.result[0].token : null;
  return { result: token };
}

async function getUserExtraFields(
  db: D1Database,
  user: User,
  includeComments: boolean,
  currentUserId?: number
): ResultOrErrorPromise<{
  contributionPoints: number;
  socialLinks: UserSocialAccount[];
  comments?: ComicComment[];
}> {
  const socialLinksQuery =
    'SELECT id, username, platform FROM usersocialaccount WHERE userId = ?';
  const socialLinksPromise = queryDb<UserSocialAccount[]>(
    db,
    socialLinksQuery,
    [user.id],
    'Social links'
  );

  const comments: ComicComment[] = [];
  if (includeComments) {
    const knownUserFields = `'${user.username}' AS username, ${user.profilePictureToken ? `'${user.profilePictureToken}' AS profilePictureToken` : 'NULL AS profilePictureToken'}`;

    const commentsQuery = `
      SELECT
        comiccomment.id AS id, comment, comiccomment.timestamp AS timestamp, comicId,
        comic.name AS comicName, comiccomment.isHidden, ${user.id} AS userId,
        ${knownUserFields}
      FROM comiccomment 
      INNER JOIN comic ON comiccomment.comicId = comic.id
      WHERE userId = ?
    `;
    const commentsRes = await queryDb<DbComment[]>(
      db,
      commentsQuery,
      [user.id],
      'User comments'
    );

    if (commentsRes.isError) {
      return makeDbErrObj(commentsRes, 'Error getting user comments', {
        userId: user.id,
      });
    }

    const commentVotesQuery = `
      SELECT 
        id, userId, commentId, isUpvote
      FROM comiccommentvote 
      WHERE userId = ?
    `;
    const commentVotesRes = await queryDb<DbCommentVote[]>(
      db,
      commentVotesQuery,
      [user.id],
      'User comment votes'
    );

    if (commentVotesRes.isError) {
      return makeDbErrObj(commentVotesRes, 'Error getting user comment votes', {
        userId: user.id,
      });
    }

    const commentVotes = commentVotesRes.result;
    const mappedComments: ComicComment[] = mergeCommentsAndVotes(
      commentsRes.result,
      commentVotes,
      currentUserId
    );

    comments.push(...mappedComments);
  }

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
        comments,
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
        comments,
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
