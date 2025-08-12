import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { getExistingChatParticipantIdsByToken } from '~/route-funcs/get-existing-chat';
import { MAX_MESSAGE_LENGTH } from '~/types/constants';
import type { QueryWithParams } from '~/utils/database-facade';
import { queryDbMultiple } from '~/utils/database-facade';
import { redirectIfNotLoggedIn } from '~/utils/loaders';
import { create400Json, processApiError } from '~/utils/request-helpers';

export async function action(args: ActionFunctionArgs) {
  const user = await redirectIfNotLoggedIn(args);

  const formData = await args.request.formData();
  const chatToken = formData.get('chatToken') as string;
  const message = formData.get('message') as string;
  const logCtx = { chatToken, message, userId: user.userId };

  if (!chatToken || !message) {
    return create400Json('Missing chatToken or message');
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return create400Json('Message is too long');
  }

  const chatParticipantRes = await getExistingChatParticipantIdsByToken(
    args.context.cloudflare.env.DB,
    chatToken
  );
  if (chatParticipantRes.err) {
    return processApiError(
      'Error getting chat participants in /send-chat-message',
      chatParticipantRes.err,
      logCtx
    );
  }

  if (!chatParticipantRes.result.includes(user.userId)) {
    return create400Json('You are not a participant in this chat');
  }
  const otherParticipantId = chatParticipantRes.result.find(id => id !== user.userId);

  const queriesWithParams: QueryWithParams[] = [
    {
      query: `INSERT INTO chatmessage (chatToken, senderId, messageText) VALUES (?, ?, ?)`,
      params: [chatToken, user.userId, message],
      queryName: 'Send chat message',
    },
    {
      query: `UPDATE chat SET isRead = 0 WHERE token = ?`,
      params: [chatToken],
      queryName: 'Update chat isRead',
    },
  ];

  if (otherParticipantId) {
    queriesWithParams.push({
      query: `INSERT OR IGNORE INTO chatnotification (userId) VALUES (?)`,
      params: [otherParticipantId],
      queryName: 'Create chat notification',
    });
  }

  const queryRes = await queryDbMultiple(
    args.context.cloudflare.env.DB,
    queriesWithParams
  );

  if (queryRes.isError) {
    return processApiError('Error sending chat message in /send-chat-message', {
      error: queryRes,
      logMessage: '',
    });
  }

  return null;
}
