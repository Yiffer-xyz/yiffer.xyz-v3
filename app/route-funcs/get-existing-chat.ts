import type { QueryWithParams } from '~/utils/database-facade';
import { queryDb, queryDbMultiple } from '~/utils/database-facade';
import type { ResultOrErrorPromise } from '~/utils/request-helpers';
import { makeDbErrObj } from '~/utils/request-helpers';

export async function getExistingChatInfoAndParticipantIdsByToken(
  db: D1Database,
  token: string
): ResultOrErrorPromise<{
  isSystemChat: boolean;
  participantIds: number[];
}> {
  const queries: QueryWithParams[] = [
    {
      query: `SELECT userId FROM chatmember WHERE chatToken = ?`,
      params: [token],
      queryName: 'Get chat member IDs',
    },
    {
      query: `SELECT isSystemChat FROM chat WHERE token = ?`,
      params: [token],
      queryName: 'Get isSystemChat info',
    },
  ];

  const dbRes = await queryDbMultiple<[{ userId: number }[], { isSystemChat: 1 | 0 }[]]>(
    db,
    queries
  );

  if (dbRes.isError) {
    return makeDbErrObj(dbRes, 'Error getting chat info and participant IDs');
  }

  const [participantIds, isSystemChat] = dbRes.result;

  return {
    result: {
      isSystemChat: isSystemChat[0].isSystemChat === 1,
      participantIds: participantIds.map(p => p.userId),
    },
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
       WHERE chat.isSystemChat = 1 AND chatmember.userId = ?`;
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
