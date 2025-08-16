import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { redirect, useLoaderData, useNavigate } from '@remix-run/react';
import { format } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { IoSend } from 'react-icons/io5';
import { getChat } from '~/route-funcs/get-chat';
import { MAX_MESSAGE_LENGTH } from '~/types/constants';
import { isModOrAdmin } from '~/types/types';
import IconButton from '~/ui-components/Buttons/IconButton';
import ProfilePicture from '~/ui-components/ProfilePicture/ProfilePicture';
import Username from '~/ui-components/Username';
import { getTimeAgoShort } from '~/utils/date-utils';
import { redirectIfNotLoggedIn } from '~/utils/loaders';
import { processApiError } from '~/utils/request-helpers';
import { useGoodFetcher } from '~/utils/useGoodFetcher';

export async function loader(args: LoaderFunctionArgs) {
  const currentUser = await redirectIfNotLoggedIn(args);
  const { chatId } = args.params;
  if (!chatId) {
    return redirect('/me/messages');
  }

  const res = await getChat(
    args.context.cloudflare.env.DB,
    currentUser.userId,
    isModOrAdmin(currentUser),
    chatId,
    true
  );

  if (res.err) {
    return processApiError('Error getting chat', res.err);
  }

  const { chat, messages, blockedStatus } = res.result;

  messages.reverse();

  return {
    chat,
    messages,
    blockedStatus,
    currentUser,
    pagesPath: args.context.cloudflare.env.PAGES_PATH,
  };
}

export default function Message() {
  const navigate = useNavigate();
  const { chat, messages, blockedStatus, currentUser, pagesPath } =
    useLoaderData<typeof loader>();

  const otherUser = chat.members.find(member => member.id !== currentUser.userId);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState('');

  function onNavigateBack() {
    navigate('/me/messages');
  }

  const getFromUser = (fromUserId: number | null) => {
    if (!fromUserId) {
      return null;
    }
    return chat.members.find(member => member.id === fromUserId);
  };

  const sendMessageFetcher = useGoodFetcher({
    url: '/api/send-chat-message',
    method: 'post',
  });

  async function onSendMessage() {
    if (message.length === 0) {
      return;
    }

    sendMessageFetcher.submit({
      chatToken: chat.token,
      message: message.trim(),
    });

    setMessage('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      onSendMessage();
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView();
  }, [messages]);

  const isUnreadByOtherUser =
    !chat.isRead &&
    messages.length > 0 &&
    messages[messages.length - 1]?.fromUserId === currentUser.userId;
  const isReadByOtherUser =
    chat.isRead &&
    messages.length > 0 &&
    messages[messages.length - 1]?.fromUserId === currentUser.userId;

  return (
    <>
      <div
        className={`border-b border-b-gray-900 dark:border-b-gray-500 p-3 flex flex-row items-center justify-between h-12`}
      >
        <div className="w-12">
          <IconButton
            icon={FaArrowLeft}
            className="w-8"
            noPadding
            variant="naked"
            onClick={onNavigateBack}
          />
        </div>
        {otherUser ? (
          <Username
            positionVertical="bottom"
            positionHorizontal="center"
            id={otherUser.id}
            username={otherUser.username}
            pagesPath={pagesPath}
            showRightArrow={false}
          />
        ) : (
          'SYSTEM MESSAGE'
        )}
        <div className="w-12">
          {isUnreadByOtherUser && (
            <p className="text-sm text-gray-700 dark:text-gray-750 mt-0.5 text-right">
              Unread
            </p>
          )}
          {isReadByOtherUser && (
            <p className="text-sm text-gray-700 dark:text-gray-750 mt-0.5 text-right">
              Read
            </p>
          )}
        </div>
      </div>

      <div className="p-3 flex pb-0 flex-col gap-4 grow overflow-y-auto overflow-hidden scrollbar scrollbar-thumb-gray-850 dark:scrollbar-thumb-gray-600 scrollbar-track-white dark:scrollbar-track-gray-300">
        {messages.map(message => {
          const isMyMessage = message.fromUserId === currentUser.userId;

          return (
            <div
              key={message.id}
              className={`flex ${isMyMessage ? 'flex-row-reverse' : 'flex-row'} gap-2`}
            >
              {message.fromUserId ? (
                <ProfilePicture
                  user={getFromUser(message.fromUserId)}
                  pagesPath={pagesPath}
                  className="w-12 h-12"
                />
              ) : (
                <div className="w-12 h-12">SYSTEM</div>
              )}
              <div
                className={`max-w-[70%] flex flex-col justify-center items-${isMyMessage ? 'end' : 'start'}`}
              >
                <p
                  className={`text-sm whitespace-pre-wrap ${isMyMessage ? 'text-right' : 'text-left'}`}
                >
                  {message.messageText}
                </p>
                <p
                  className={`text-xs mt-1 ${isMyMessage ? 'text-right' : 'text-left'} text-gray-700`}
                >
                  {getTimeAgoShort(message.timestamp)} -{' '}
                  {format(message.timestamp, 'MMM do, hh:mm')}
                </p>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {blockedStatus === null ? (
        <div
          className={`p-3 bg-white dark:bg-gray-300 
          flex flex-row gap-2 items-center border-t border-t-gray-900 dark:border-t-gray-500`}
        >
          <textarea
            rows={2}
            className="w-full bg-gray-900 dark:bg-gray-400 rounded-sm px-3 py-2"
            placeholder="Write a message..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sendMessageFetcher.isLoading}
          />
          <IconButton
            icon={IoSend}
            variant="naked"
            className="w-9! h-8! text-xl"
            disabled={message.length > MAX_MESSAGE_LENGTH || sendMessageFetcher.isLoading}
            onClick={onSendMessage}
          />
        </div>
      ) : (
        <div className="px-3 pb-4 pt-2">
          <p className="text-red-strong-200 dark:text-red-strong-300 text-sm font-semibold text-center">
            {blockedStatus === 'both-blocked' && 'You have mutually blocked each other.'}
            {blockedStatus === 'blocked' && 'You have blocked this user.'}
            {blockedStatus === 'blocked-by' && 'This user has blocked you.'}
          </p>
          <p className="text-red-strong-200 dark:text-red-strong-300 text-sm font-semibold text-center">
            Messages can not be sent by either user.
          </p>
        </div>
      )}

      {message.length >= MAX_MESSAGE_LENGTH && (
        <p className="text-sm text-red-strong-200 font-semibold ml-4 mb-3 -mt-1">
          {message.length}/{MAX_MESSAGE_LENGTH} characters
        </p>
      )}
    </>
  );
}
