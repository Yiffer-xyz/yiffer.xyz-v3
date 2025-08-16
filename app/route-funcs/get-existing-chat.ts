import { queryDb } from '~/utils/database-facade';
import type { ResultOrErrorPromise } from '~/utils/request-helpers';
import { makeDbErrObj } from '~/utils/request-helpers';

export async function getExistingChatParticipantIdsByToken(
  db: D1Database,
  token: string
): ResultOrErrorPromise<number[]> {
  const existingChat = await queryDb<any[]>(
    db,
    `SELECT userId FROM chatmember WHERE chatToken = ?`,
    [token]
  );

  if (existingChat.isError) {
    return makeDbErrObj(existingChat, 'Error getting chat');
  }

  return {
    result: existingChat.result.map(row => row.userId),
  };
}

export async function getExistingChatTokenByParticipantIds(
  db: D1Database,
  user1: number,
  user2: number | null
): ResultOrErrorPromise<{ chatToken: string | null }> {
  const existingChatQuery = user2
    ? `SELECT chatToken FROM chatmember WHERE userId IN (?, ?)
       GROUP BY chatToken HAVING COUNT(DISTINCT userId) = 2`
    : `SELECT * FROM chat INNER JOIN chatmember ON (chat.token = chatmember.chatToken)
       WHERE chat.isSystemChat = 0 AND chatmember.userId = ?`;
  const existingParams = user2 ? [user1, user2] : [user1];

  const existingChat = await queryDb<any[]>(db, existingChatQuery, existingParams);

  if (existingChat.isError) {
    return makeDbErrObj(existingChat, 'Error getting chat');
  }

  return {
    result: {
      chatToken: existingChat.result.length > 0 ? existingChat.result[0].chatToken : null,
    },
  };
}
