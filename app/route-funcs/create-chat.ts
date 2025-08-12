import type { QueryWithParams } from '~/utils/database-facade';
import { queryDbExec, queryDbMultiple } from '~/utils/database-facade';
import {
  makeDbErrObj,
  wrapApiError,
  type ResultOrErrorPromise,
} from '~/utils/request-helpers';
import { generateToken } from '~/utils/string-utils';
import { getExistingChatTokenByParticipantIds } from './get-existing-chat';
import { MAX_MESSAGE_LENGTH } from '~/types/constants';
import { getUserByField } from './get-user';

export async function createChat({
  db,
  fromUserId,
  toUserId,
  message,
}: {
  db: D1Database;
  fromUserId: number | null;
  toUserId: number | null;
  message: string;
}): ResultOrErrorPromise<{ chatToken: string }> {
  if (!fromUserId && !toUserId) return { err: { logMessage: 'No user IDs provided' } };
  const logCtx = { fromUserId, toUserId, message };

  if (message.length > MAX_MESSAGE_LENGTH) {
    return { err: { logMessage: 'Message is too long' } };
  }

  let nonNullUserId = 0;
  let maybeUserId: number | null = null;
  if (fromUserId) {
    nonNullUserId = fromUserId;
    maybeUserId = toUserId;
  } else if (toUserId) {
    nonNullUserId = toUserId;
    maybeUserId = fromUserId;
  }

  // Check for existing chat - should not be any
  const existingChatRes = await getExistingChatTokenByParticipantIds(
    db,
    nonNullUserId,
    maybeUserId
  );
  if (existingChatRes.err) {
    return {
      err: wrapApiError(existingChatRes.err, 'Error checking for existing chat', logCtx),
    };
  } else if (existingChatRes.result.chatToken) {
    return { err: { logMessage: 'Chat already exists', context: logCtx } };
  }

  // Make sure recipient hasn't turned off message receiving - should be blocked by front-end, but make sure
  if (toUserId) {
    const userRes = await getUserByField({
      db,
      field: 'id',
      value: toUserId,
    });
    if (userRes.err) {
      return {
        err: wrapApiError(userRes.err, 'Error getting user in new message', logCtx),
      };
    } else if (userRes.notFound) {
      return { err: { logMessage: 'User not found', context: logCtx } };
    }
    if (!userRes.result.allowMessages) {
      return { err: { logMessage: 'User has disabled new messages', context: logCtx } };
    }
  }

  // Create new chat
  const chatToken = generateToken();
  const newChatQuery = `INSERT INTO chat (token, isSystemChat) VALUES (?, ?)`;
  const newChat = await queryDbExec(
    db,
    newChatQuery,
    [chatToken, !maybeUserId],
    'Create chat'
  );
  if (newChat.isError) {
    return makeDbErrObj(newChat, 'Error creating new chat', logCtx);
  }

  // Add chat member(s)
  const addChatMemberQueries: QueryWithParams[] = [
    {
      query: `INSERT INTO chatmember (chatToken, userId) VALUES (?, ?)`,
      params: [chatToken, nonNullUserId],
      queryName: 'Add chat member',
    },
    {
      query: `INSERT INTO chatmessage (chatToken, senderId, messageText) VALUES (?, ?, ?)`,
      params: [chatToken, fromUserId, message],
      queryName: 'Add chat message',
    },
  ];
  if (maybeUserId) {
    addChatMemberQueries.push({
      query: `INSERT INTO chatmember (chatToken, userId) VALUES (?, ?)`,
      params: [chatToken, maybeUserId],
      queryName: 'Add chat member',
    });
  }

  const dbRes = await queryDbMultiple(db, addChatMemberQueries);
  if (dbRes.isError) {
    queryDbExec(db, `DELETE FROM chat WHERE token = ?`, [chatToken], 'Delete chat');
    return makeDbErrObj(dbRes, 'Error adding chat member(s) and message');
  }

  // Create chat notification - only after successful chat creation
  if (toUserId !== null) {
    const createChatNotificationQuery = `INSERT OR IGNORE INTO chatnotification (userId) VALUES (?)`;
    const createChatNotification = await queryDbExec(
      db,
      createChatNotificationQuery,
      [toUserId],
      'Create chat notification'
    );
    if (createChatNotification.isError) {
      return makeDbErrObj(createChatNotification, 'Error creating chat notification');
    }
  }

  return { result: { chatToken } };
}
