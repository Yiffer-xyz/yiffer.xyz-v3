import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { getExistingChatInfoAndParticipantIdsByToken } from '~/route-funcs/get-existing-chat';
import { MAX_MESSAGE_LENGTH } from '~/types/constants';
import { isModOrAdmin } from '~/types/types';
import type { QueryWithParams } from '~/utils/database-facade';
import { queryDbMultiple } from '~/utils/database-facade';
import { redirectIfNotLoggedIn } from '~/utils/loaders';
import { create400Json, processApiError } from '~/utils/request-helpers';
import { createSystemChatReplyForwardEmail, sendEmail } from '~/utils/send-email';

export async function action(args: ActionFunctionArgs) {
  const user = await redirectIfNotLoggedIn(args);

  const formData = await args.request.formData();
  const chatToken = formData.get('chatToken') as string;
  const message = formData.get('message') as string;
  const isFromSystem = formData.get('isFromSystem') === 'true';
  const logCtx = { chatToken, message, userId: user.userId, isFromSystem };

  if (!chatToken || !message) {
    return create400Json('Missing chatToken or message');
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return create400Json('Message is too long');
  }
  if (isFromSystem && !isModOrAdmin(user)) {
    return create400Json('You are not authorized to send messages from the system');
  }

  const chatInfoAndParticipantRes = await getExistingChatInfoAndParticipantIdsByToken(
    args.context.cloudflare.env.DB,
    chatToken
  );
  if (chatInfoAndParticipantRes.err) {
    return processApiError(
      'Error getting chat info and participant IDs in /send-chat-message',
      chatInfoAndParticipantRes.err,
      logCtx
    );
  }

  const { isSystemChat, participantIds } = chatInfoAndParticipantRes.result;
  if (participantIds.length === 0) {
    return create400Json('Chat not found');
  }

  if (!participantIds.includes(user.userId) && !isFromSystem) {
    return create400Json('You are not a participant in this chat');
  }
  if (isFromSystem && !isSystemChat) {
    return create400Json('You are not authorized to send messages from the system');
  }

  let otherParticipantId: number | null = null;
  if (isFromSystem) {
    otherParticipantId = participantIds[0];
  } else if (!isSystemChat) {
    otherParticipantId = participantIds.find(id => id !== user.userId) ?? null;
    if (!otherParticipantId || participantIds.length < 2) {
      return create400Json('Chat members not found');
    }
  }

  const queriesWithParams: QueryWithParams[] = [
    {
      query: `INSERT INTO chatmessage (chatToken, senderId, messageText) VALUES (?, ?, ?)`,
      params: [chatToken, isFromSystem ? null : user.userId, message],
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

  if (isSystemChat && !isFromSystem) {
    await sendEmail(
      createSystemChatReplyForwardEmail({
        chatToken,
        message,
        username: user.username,
        frontEndUrlBase: args.context.cloudflare.env.FRONT_END_URL_BASE,
      }),
      args.context.cloudflare.env.POSTMARK_TOKEN
    );
  }

  return null;
}
