import { format } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import type { Chat, ChatMessage } from '~/types/types';
import IconButton from '~/ui-components/Buttons/IconButton';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import ProfilePicture from '~/ui-components/ProfilePicture';
import Username from '~/ui-components/Username';
import { getTimeAgoShort } from '~/utils/date-utils';

export default function ScrollingChat({
  chat,
  onNavigateBack,
  rightUserId,
  pagesPath,
  messages,
  hasNextPage,
  isFetchingNextPage,
  fetchMoreMessages,
  isInAdminPanel,
}: {
  chat: Chat;
  onNavigateBack?: () => void;
  rightUserId: number | null;
  pagesPath: string;
  messages: ChatMessage[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchMoreMessages?: (page: number) => void;
  isInAdminPanel?: boolean;
}) {
  const [page, setPage] = useState(1);

  const mainUser = chat.members.find(member => member.id === rightUserId);
  const otherUser = chat.members.find(member => member.id !== rightUserId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevTokenRef = useRef<string>(undefined);
  const prevLastMessageIdRef = useRef<number>(undefined);
  const prevTopMessageIdRef = useRef<number>(undefined);
  const shouldScrollOnMoreMessagesRef = useRef<boolean>(false);

  function onLoadMoreMessages() {
    prevTopMessageIdRef.current = messages[0].id;
    shouldScrollOnMoreMessagesRef.current = true;
    fetchMoreMessages?.(page + 1);
    setPage(prev => prev + 1);
  }

  function userIdToUsername(userId: number) {
    return chat.members.find(member => member.id === userId)?.username;
  }

  // Reset messages if chat (token) changed
  useEffect(() => {
    if (chat.token !== prevTokenRef.current) {
      setPage(1);
      prevTokenRef.current = chat.token;
      shouldScrollOnMoreMessagesRef.current = false;
      prevTopMessageIdRef.current = undefined;
    }
  }, [chat.token]);

  useEffect(() => {
    // Scroll if new bottom message
    if (messages.length === 0) return;
    const newLastMsgId = messages[messages.length - 1].id;

    // If new bottom message, always scroll down
    if (newLastMsgId !== prevLastMessageIdRef.current) {
      prevLastMessageIdRef.current = newLastMsgId;
      messagesEndRef.current?.scrollIntoView();
    }
    // Otherwise, look for message 1 above last top (looks better)
    else if (shouldScrollOnMoreMessagesRef.current && prevTopMessageIdRef.current) {
      const prevTopMessage = messages.find(m => m.id === prevTopMessageIdRef.current);
      if (!prevTopMessage) return;

      const prevTopMessageTimestamp = prevTopMessage.timestamp.getTime();
      const allBiggerMessageElements: HTMLElement[] = [];
      let biggestOlderTimestamp = 0;

      let aboveMessage: ChatMessage | undefined;
      for (const message of messages) {
        if (message.timestamp.getTime() < prevTopMessageTimestamp) {
          const element = document.getElementById(`message-${message.id}`);
          if (!element) return;
          allBiggerMessageElements.push(element);
          if (message.timestamp.getTime() > biggestOlderTimestamp) {
            biggestOlderTimestamp = message.timestamp.getTime();
            aboveMessage = message;
          }
        }
      }

      if (!aboveMessage) return;

      const prevTopMessageElement = document.getElementById(`message-${aboveMessage.id}`);
      if (prevTopMessageElement) {
        prevTopMessageElement.scrollIntoView();

        const bgClass = ' bg-theme1-primary-trans dark:bg-theme1-primary-more-trans ';

        // In order: Instantly give bg color -> wait -> fade it out -> remove transition
        allBiggerMessageElements.forEach(m => (m.className += bgClass));
        setTimeout(() => {
          allBiggerMessageElements.forEach(m => {
            m.className += ' duration-1500';
          });
        }, 500);

        setTimeout(() => {
          allBiggerMessageElements.forEach(m => {
            m.className = m.className.replace(bgClass, '');
          });
        }, 1500);

        setTimeout(() => {
          allBiggerMessageElements.forEach(m => {
            m.className = m.className.replace('duration-1500', '');
          });
        }, 3000);
      }
    }
  }, [messages]);

  function getFromUser(fromUserId: number | null) {
    if (!fromUserId) {
      return null;
    }
    return chat.members.find(member => member.id === fromUserId);
  }

  return (
    <>
      <div
        className={`border-b border-b-gray-900 dark:border-b-gray-500 p-3 flex flex-row items-center justify-between h-12`}
      >
        <div className="w-12">
          {onNavigateBack && (
            <IconButton
              icon={FaArrowLeft}
              className="w-8"
              noPadding
              variant="naked"
              onClick={onNavigateBack}
            />
          )}
        </div>
        <div className="flex flex-row items-center">
          {isInAdminPanel && mainUser && (
            <>
              <Username
                positionVertical="bottom"
                positionHorizontal="center"
                id={mainUser.id}
                username={mainUser.username}
                pagesPath={pagesPath}
                showRightArrow={false}
              />
              <p className="mx-1.5">&</p>
            </>
          )}
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
            'System messages'
          )}
        </div>
        <div className="w-12">
          <p className="text-sm text-gray-700 dark:text-gray-750 mt-0.5 text-right">
            {chat.isRead ? 'Read' : 'Unread'}
          </p>
        </div>
      </div>

      {!otherUser && (
        <div className="w-full p-2 bg-blue-more-trans flex items-center justify-center text-xs text-center">
          If replying, be respectful and to the point.
          <br />
          There is usually no need to reply to messages received here.
          <br />
          Abusing, spamming, or sending pointless messages in this chat can result in a
          ban.
          <br />
        </div>
      )}

      <div className="p-3 flex pb-0 flex-col gap-2 grow overflow-y-auto overflow-hidden scrollbar scrollbar-thumb-gray-850 dark:scrollbar-thumb-gray-600 scrollbar-track-white dark:scrollbar-track-gray-300">
        {hasNextPage && (
          <LoadingButton
            text="Load more messages"
            isLoading={isFetchingNextPage}
            variant="naked"
            onClick={onLoadMoreMessages}
            className="mx-auto"
          />
        )}

        {messages.map(message => {
          const isMyMessage = message.fromUserId === rightUserId;

          return (
            <div
              key={message.id}
              className={`flex ${isMyMessage ? 'flex-row-reverse' : 'flex-row'} gap-2 transition-[background-color] py-2 rounded-sm`}
              id={`message-${message.id}`}
            >
              <ProfilePicture
                user={getFromUser(message.fromUserId)}
                pagesPath={pagesPath}
                className="w-12 h-12"
              />
              <div
                className={`max-w-[70%] flex flex-col justify-center items-${isMyMessage ? 'end' : 'start'}`}
              >
                <p
                  className={`text-sm whitespace-pre-wrap break-all ${isMyMessage ? 'text-right' : 'text-left'}`}
                >
                  {message.messageText}
                </p>
                <p
                  className={`text-xs mt-1 ${isMyMessage ? 'text-right' : 'text-left'} text-gray-700`}
                >
                  {isInAdminPanel
                    ? `${userIdToUsername(message.fromUserId ?? 0)} - `
                    : ''}
                  {getTimeAgoShort(message.timestamp)} -{' '}
                  {format(message.timestamp, 'MMM do, hh:mm')}
                </p>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>
    </>
  );
}
