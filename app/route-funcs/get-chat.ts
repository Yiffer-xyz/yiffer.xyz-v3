import type {
  Chat,
  ChatMessage,
  DbChatMessage,
  MinimalUser,
  UserBlockStatus,
} from '~/types/types';
import type { QueryWithParams } from '~/utils/database-facade';
import { queryDbExec, queryDbMultiple } from '~/utils/database-facade';
import { parseDbDateStr } from '~/utils/date-utils';
import type { ResultOrErrorPromise } from '~/utils/request-helpers';
import { makeDbErrObj } from '~/utils/request-helpers';
import { getUserBlockStatus } from './get-user-block-status';
import { MESSAGES_PAGINATION_SIZE } from '~/types/constants';

export async function getChat({
  db,
  userId,
  isModOrAdmin,
  chatToken,
  markReadIfAppropriate,
  page,
  getBlockedStatus,
  getFullChatIgnorePagination,
}: {
  db: D1Database;
  userId?: number;
  isModOrAdmin: boolean;
  chatToken: string;
  markReadIfAppropriate: boolean;
  page: number;
  getBlockedStatus: boolean;
  getFullChatIgnorePagination?: boolean;
}): ResultOrErrorPromise<{
  chat: Chat;
  messages: ChatMessage[];
  blockedStatus: UserBlockStatus;
  hasNextPage: boolean;
}> {
  const messagesQuery = ` 
    SELECT id, senderId, messageText, timestamp FROM chatmessage
    WHERE chatToken = ?
    ORDER BY timestamp DESC
    ${getFullChatIgnorePagination ? '' : 'LIMIT ? OFFSET ?'}
  `;
  const messagesParams: any[] = [chatToken];
  if (!getFullChatIgnorePagination) {
    messagesParams.push(MESSAGES_PAGINATION_SIZE + 1);
    messagesParams.push((page - 1) * MESSAGES_PAGINATION_SIZE);
  }

  const chatMembersQuery = `SELECT 
      userId AS id, user.username, user.profilePictureToken, chat.isRead AS isChatRead
    FROM chatmember
    INNER JOIN user ON (chatmember.userId = user.id)
    INNER JOIN chat ON (chatmember.chatToken = chat.token)
    WHERE chatToken = ?
  `;
  const chatMembersParams = [chatToken];

  const queriesWithParams: QueryWithParams[] = [
    {
      query: messagesQuery,
      params: messagesParams,
      queryName: 'Get chat messages',
    },
    {
      query: chatMembersQuery,
      params: chatMembersParams,
      queryName: 'Get chat members',
    },
  ];

  const dbRes = await queryDbMultiple<
    [DbChatMessage[], (MinimalUser & { isChatRead: 1 | 0 })[]]
  >(db, queriesWithParams);

  if (dbRes.isError) {
    return makeDbErrObj(dbRes, 'Error getting chat/messages', { chatToken, userId });
  }

  const [messagesDb, chatMembers] = dbRes.result;

  if (!isModOrAdmin) {
    if (!chatMembers.some(member => member.id === userId)) {
      return {
        err: {
          logMessage: 'Not authorized to access chat',
          context: { chatToken, userId },
        },
      };
    }
  }

  const isSystemChat = chatMembers.length === 1;

  const chat: Chat = {
    token: chatToken,
    members: chatMembers.map(member => ({
      id: member.id,
      username: member.username,
      profilePictureToken: member.profilePictureToken,
    })),
    isRead: chatMembers[0].isChatRead === 1, // isChatRead is duplicated on both rows
    isSystemChat,
  };

  const messages: ChatMessage[] = messagesDb.map(message => ({
    id: message.id,
    fromUserId: message.senderId,
    timestamp: parseDbDateStr(message.timestamp),
    messageText: message.messageText,
  }));

  // We fetch one extra just to know if hasNextPage should be true
  if (messages.length === MESSAGES_PAGINATION_SIZE + 1) {
    messages.pop();
  }

  const mainChatUser = userId
    ? chatMembers.find(member => member.id === userId)
    : chatMembers[0];

  const otherChatUser = userId
    ? chatMembers.find(member => member.id !== userId)
    : chatMembers.length >= 2
      ? chatMembers[1]
      : undefined;

  let blockedStatus: UserBlockStatus = null;
  if (getBlockedStatus && mainChatUser) {
    if (!chat.isSystemChat && otherChatUser) {
      const blockedStatusRes = await getUserBlockStatus(
        db,
        mainChatUser.id,
        otherChatUser.id
      );
      if (blockedStatusRes.err) {
        return {
          err: {
            logMessage: 'Error getting blocked status',
            context: { chatToken, userId, otherUserId: chatMembers[0].id },
          },
        };
      }
      blockedStatus = blockedStatusRes.result;
    }
  }

  let isLastMessageByOtherUser = false;
  const latestMessage = messages[0];
  if (messages.length > 0) {
    if (isSystemChat) {
      if (!userId) {
        // reading as system
        isLastMessageByOtherUser = latestMessage.fromUserId !== null;
      } else {
        // reading as user
        isLastMessageByOtherUser = latestMessage.fromUserId === null;
      }
    } else {
      isLastMessageByOtherUser = latestMessage.fromUserId !== userId;
    }
  }

  // If last message is by other user, and isRead is false, set it to true
  if (markReadIfAppropriate && isLastMessageByOtherUser && !chat.isRead) {
    const setReadQuery = `UPDATE chat SET isRead = 1 WHERE token = ?`;
    const setReadParams = [chatToken];
    const setReadRes = await queryDbExec(
      db,
      setReadQuery,
      setReadParams,
      'Set chat read'
    );
    if (setReadRes.isError) {
      return makeDbErrObj(setReadRes, 'Error setting chat read', { chatToken, userId });
    }
    chat.isRead = true;
  }

  return {
    result: {
      chat,
      messages,
      blockedStatus,
      hasNextPage: messagesDb.length > MESSAGES_PAGINATION_SIZE,
    },
  };
}
