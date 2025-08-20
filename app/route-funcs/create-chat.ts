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
import { canSendMessage } from './can-send-message';

export async function createChat({
  db,
  fromUserId,
  toUserId,
  message,
}: {
  db: D1Database;
  fromUserId: number | null;
  toUserId: number;
  message: string;
}): ResultOrErrorPromise<{ chatToken: string }> {
  if (!toUserId) return { err: { logMessage: 'No toUserId provided' } };
  const logCtx = { fromUserId, toUserId, message };

  if (message.length > MAX_MESSAGE_LENGTH) {
    return { err: { logMessage: 'Message is too long' } };
  }

  // Check for existing chat - should not be any
  const existingChatRes = await getExistingChatTokenByParticipantIds(
    db,
    toUserId,
    fromUserId
  );
  if (existingChatRes.err) {
    return {
      err: wrapApiError(existingChatRes.err, 'Error checking for existing chat', logCtx),
    };
  } else if (existingChatRes.result.chatToken) {
    return { err: { logMessage: 'Chat already exists', context: logCtx } };
  }

  // Make sure recipient hasn't turned off message receiving and check for blocks
  if (fromUserId) {
    const canSendResult = await canSendMessage(db, fromUserId, toUserId);

    if (canSendResult.err) {
      return {
        err: wrapApiError(
          canSendResult.err,
          'Error checking if user can send message',
          logCtx
        ),
      };
    }

    if (!canSendResult.result) {
      return {
        err: {
          logMessage: 'Cannot send message to this user (blocked or messages disabled)',
          context: logCtx,
        },
      };
    }
  }

  // Create new chat
  const chatToken = generateToken();
  const newChatQuery = `INSERT INTO chat (token, isSystemChat) VALUES (?, ?)`;
  const newChat = await queryDbExec(
    db,
    newChatQuery,
    [chatToken, fromUserId ? 0 : 1],
    'Create chat'
  );
  if (newChat.isError) {
    return makeDbErrObj(newChat, 'Error creating new chat', logCtx);
  }

  // Add chat member(s)
  const addChatMemberQueries: QueryWithParams[] = [
    {
      query: `INSERT INTO chatmember (chatToken, userId) VALUES (?, ?)`,
      params: [chatToken, toUserId],
      queryName: 'Add chat member',
    },
    {
      query: `INSERT INTO chatmessage (chatToken, senderId, messageText) VALUES (?, ?, ?)`,
      params: [chatToken, fromUserId, message],
      queryName: 'Add chat message',
    },
  ];
  if (fromUserId) {
    addChatMemberQueries.push({
      query: `INSERT INTO chatmember (chatToken, userId) VALUES (?, ?)`,
      params: [chatToken, fromUserId],
      queryName: 'Add chat member',
    });
  }

  const dbRes = await queryDbMultiple(db, addChatMemberQueries);
  if (dbRes.isError) {
    queryDbExec(db, `DELETE FROM chat WHERE token = ?`, [chatToken], 'Delete chat');
    return makeDbErrObj(dbRes, 'Error adding chat member(s) and message');
  }

  // Create chat notification - only after successful chat creation
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

  return { result: { chatToken } };
}
