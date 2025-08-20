import type { D1Database } from '@cloudflare/workers-types';
import { ADMIN_CHAT_LIST_PAGESIZE } from '~/types/constants';
import type { Chat, MinimalUser } from '~/types/types';
import { queryDb, queryDbExec } from '~/utils/database-facade';
import { parseDbDateStr } from '~/utils/date-utils';
import { makeDbErrObj, type ResultOrErrorPromise } from '~/utils/request-helpers';

type DbReturn = {
  chatToken: string;
  isSystemChat: 0 | 1;
  isRead: 0 | 1;
  lastMessageId: number;
  lastMessageTimestamp: string;
  lastMessageText: string;
  lastMessageSenderId: number | null;
  users: string;
};

export async function getChatList({
  db,
  userId,
  systemChatMode,
  clearChatNotification,
  page,
}: {
  db: D1Database;
  userId?: number;
  systemChatMode: 'only-system' | 'include' | 'exclude';
  clearChatNotification?: boolean;
  page?: number;
}): ResultOrErrorPromise<Chat[]> {
  if (clearChatNotification && userId) {
    const query = `DELETE FROM chatnotification WHERE userId = ?`;
    const dbRes = await queryDbExec(db, query, [userId], 'Clear chat notification');
    if (dbRes.isError) {
      return makeDbErrObj(dbRes, 'Error clearing chat notification');
    }
  }

  let systemChatWhereStr = '';
  if (systemChatMode === 'exclude') systemChatWhereStr = 'WHERE c.isSystemChat = 0';
  if (systemChatMode === 'only-system') systemChatWhereStr = 'WHERE c.isSystemChat = 1';

  let query = `
    WITH user_chats AS (
      SELECT cm.chatToken
      FROM chatmember AS cm
      ${userId ? 'WHERE cm.userId = ?' : ''}
    ),
    latest_messages AS (
      SELECT
        m.chatToken,
        m.timestamp AS lastMessageTimestamp,
        m.messageText AS lastMessageText,
        m.senderId  AS lastMessageSenderId,
        m.id AS lastMessageId,
        ROW_NUMBER() OVER (
          PARTITION BY m.chatToken
          ORDER BY m.timestamp DESC, m.id DESC
        ) AS rn
      FROM chatmessage AS m
      JOIN user_chats uc ON uc.chatToken = m.chatToken
    ),
    chat_user_info AS (
      SELECT
        cm.chatToken,
        u.id AS userId,
        u.username,
        u.profilePictureToken,
          '{"id":' || u.id ||
          ',"username":"' || REPLACE(u.username, '"', '""') || '"' ||
          ',"profilePictureToken":' || 
            CASE 
              WHEN u.profilePictureToken IS NULL THEN 'null' 
              ELSE '"' || REPLACE(u.profilePictureToken, '"', '""') || '"'
            END || '}'
        AS user_json
      FROM chatmember AS cm
      JOIN user u ON u.id = cm.userId
      WHERE cm.chatToken IN (SELECT chatToken FROM user_chats)
    ),
    aggregated_users AS (
      SELECT
        chatToken,
        GROUP_CONCAT(user_json, '|') AS users
      FROM chat_user_info
      GROUP BY chatToken
    )
    SELECT
      c.token AS chatToken,
      c.isSystemChat,
      c.isRead,
      lm.lastMessageId,
      lm.lastMessageTimestamp,
      lm.lastMessageText,
      lm.lastMessageSenderId,
      au.users
    FROM chat AS c
    JOIN user_chats uc ON uc.chatToken = c.token
    JOIN latest_messages lm ON lm.chatToken = c.token AND lm.rn = 1
    JOIN aggregated_users au ON au.chatToken = c.token
    ${systemChatWhereStr}
    GROUP BY c.token
    ORDER BY lm.lastMessageTimestamp DESC, c.token ASC
  `;
  if (page) {
    query += ` LIMIT ${ADMIN_CHAT_LIST_PAGESIZE} OFFSET ${(page - 1) * ADMIN_CHAT_LIST_PAGESIZE}`;
  }

  const result = await queryDb<DbReturn[]>(
    db,
    query,
    userId ? [userId] : undefined,
    `Get chat list, ${systemChatMode}`
  );

  if (result.isError) {
    return makeDbErrObj(result, 'Error in getChatList');
  }

  const chats: Chat[] = result.result.map(chat => {
    const chatUserJsons = chat.users.split('|');
    const members: MinimalUser[] = chatUserJsons.map(json => {
      const user = JSON.parse(json);
      return {
        id: user.id,
        username: user.username,
        profilePictureToken: user.profilePictureToken,
      };
    });

    const mappedChat: Chat = {
      token: chat.chatToken,
      isSystemChat: chat.isSystemChat === 1,
      isRead: chat.isRead === 1,
      members,
      latestMessage: {
        content: chat.lastMessageText,
        id: chat.lastMessageId,
        senderId: chat.lastMessageSenderId ?? null,
        timestamp: parseDbDateStr(chat.lastMessageTimestamp),
      },
    };

    return mappedChat;
  });

  return { result: chats };
}
