import { MESSAGES_PAGINATION_SIZE } from '~/types/constants';
import { isModOrAdmin } from '~/types/types';
import type { UserSession, ChatMessage } from '~/types/types';
import { queryDb } from '~/utils/database-facade';
import { parseDbDateStr } from '~/utils/date-utils';
import type { ApiError } from '~/utils/request-helpers';
import { makeDbErr, processApiError } from '~/utils/request-helpers';

type DbMessage = Omit<
  ChatMessage,
  'isRead' | 'timestamp' | 'toUser' | 'fromUser' | 'isSystemMessage'
> & {
  isRead: 0 | 1;
  timestamp: string;
  toUsername: string;
  toProfilePictureToken: string | null;
  fromUsername: string | null;
  fromProfilePictureToken: string | null;
  toUserId: number;
  fromUserId: number | null;
  isSystemMessage: 0 | 1;
};

export async function getMessages({
  currentUser,
  forUserId,
  page,
  db,
}: {
  currentUser: UserSession;
  forUserId?: number;
  page: number;
  db: D1Database;
}): Promise<{
  messages: ChatMessage[];
  err?: ApiError;
  unauthorized?: boolean;
}> {
  const offset = (page - 1) * MESSAGES_PAGINATION_SIZE;

  if (currentUser.userId !== forUserId && !isModOrAdmin(currentUser)) {
    return { unauthorized: true, messages: [] };
  }

  const query = `SELECT
      usermessage.id AS id,
      usermessage.toUserId AS toUserId,
      usermessage.fromUserId AS fromUserId,
      usermessage.isSystemMessage AS isSystemMessage,
      usermessage.messageText AS messageText,
      usermessage.isRead AS isRead,
      usermessage.isReported AS isReported,
      usermessage.timestamp AS timestamp,
      toUser.username AS toUsername,
      toUser.profilePictureToken AS toProfilePictureToken,
      fromUser.username AS fromUsername,
      fromUser.profilePictureToken AS fromProfilePictureToken
    FROM usermessage
    INNER JOIN user AS toUser ON (usermessage.toUserId = toUser.id)
    LEFT JOIN user AS fromUser ON (usermessage.fromUserId = fromUser.id)
    ${forUserId ? `WHERE toUserId = ? OR fromUserId = ?` : ''}
    ORDER BY timestamp DESC
    LIMIT ? OFFSET ?`;

  const params = forUserId ? [currentUser.userId, forUserId] : [];
  params.push(MESSAGES_PAGINATION_SIZE + 1, offset);

  const dbRes = await queryDb<DbMessage[]>(db, query, params, 'Get messages');

  if (dbRes.isError) {
    return processApiError('Error in /api/get-user-messages', makeDbErr(dbRes), {
      userId: forUserId,
      currentUserId: currentUser.userId,
    });
  }

  const mappedMessages: ChatMessage[] = dbRes.result.map(dbRow => ({
    id: dbRow.id,
    timestamp: parseDbDateStr(dbRow.timestamp),
    isRead: dbRow.isRead === 1,
    isSystemMessage: dbRow.isSystemMessage === 1,
    messageText: dbRow.messageText,
    toUser: {
      id: dbRow.toUserId,
      username: dbRow.toUsername,
      profilePictureToken: dbRow.toProfilePictureToken,
    },
    fromUser: dbRow.fromUserId
      ? {
          id: dbRow.fromUserId,
          username: dbRow.fromUsername ?? '',
          profilePictureToken: dbRow.fromProfilePictureToken,
        }
      : null,
  }));

  return { messages: mappedMessages };
}
