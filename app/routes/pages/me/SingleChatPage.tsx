import type { LoaderFunctionArgs } from 'react-router';
import { redirect, useLoaderData, useNavigate } from 'react-router';
import { useEffect, useRef, useState } from 'react';
import { IoSend } from 'react-icons/io5';
import ScrollingChat from '~/page-components/Chat/ScrollingChat';
import { getChat } from '~/route-funcs/get-chat';
import { MAX_MESSAGE_LENGTH } from '~/types/constants';
import type { ChatMessage } from '~/types/types';
import { isModOrAdmin } from '~/types/types';
import IconButton from '~/ui-components/Buttons/IconButton';
import { redirectIfNotLoggedIn } from '~/utils/loaders';
import { processApiError } from '~/utils/request-helpers';
import { useGoodFetcher } from '~/utils/useGoodFetcher';

export async function loader(args: LoaderFunctionArgs) {
  const currentUser = await redirectIfNotLoggedIn(args);
  const { token } = args.params;
  if (!token) {
    return redirect('/me/messages');
  }

  const res = await getChat({
    db: args.context.cloudflare.env.DB,
    userId: currentUser.userId,
    isModOrAdmin: isModOrAdmin(currentUser),
    chatToken: token,
    markReadIfAppropriate: true,
    getBlockedStatus: true,
    page: 1,
  });

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
    hasNextPage: res.result.hasNextPage,
  };
}

export default function MessageChat() {
  const navigate = useNavigate();
  const {
    chat,
    messages: page1Messages,
    blockedStatus,
    currentUser,
    pagesPath,
    hasNextPage: page1HasNextPage,
  } = useLoaderData<typeof loader>();

  const prevTokenRef = useRef<string>(undefined);

  const [messages, setMessages] = useState<ChatMessage[]>(page1Messages);
  const [hasNextPage, setHasNextPage] = useState(page1HasNextPage);
  const [message, setMessage] = useState('');

  // Loader + POST fetchers combo was acting weird, adding duplicates. This ensures order.
  function onMoreMessagesFetched(newMessages: ChatMessage[]) {
    const uniqueMessages = [...messages];
    newMessages.forEach(newM => {
      if (!uniqueMessages.some(uniqM => uniqM.id === newM.id)) {
        uniqueMessages.push(newM);
      }
    });
    uniqueMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    setMessages(uniqueMessages);
  }

  const messagesFetcher = useGoodFetcher<{
    messages: ChatMessage[];
    hasNextPage: boolean;
  }>({
    url: '/api/get-messages-paginated',
    method: 'POST',
    toastError: true,
    fetchGetOnLoad: false,
    onFinish: () => {
      if (messagesFetcher.data?.messages) {
        onMoreMessagesFetched(messagesFetcher.data!.messages);
      }
      setHasNextPage(!!messagesFetcher.data?.hasNextPage);
    },
  });

  const sendMessageFetcher = useGoodFetcher({
    url: '/api/send-chat-message',
    method: 'POST',
  });

  async function onSendMessage() {
    if (message.length === 0) {
      return;
    }

    await sendMessageFetcher.awaitSubmit({
      chatToken: chat.token,
      message: message.trim(),
    });
    messagesFetcher.awaitSubmit({
      chatToken: chat.token,
      page: 1,
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
    // Reset messages if chat (token) changed
    if (chat.token !== prevTokenRef.current) {
      setMessages(page1Messages);
      setHasNextPage(page1HasNextPage);
      prevTokenRef.current = chat.token;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat.token]);

  return (
    <>
      <ScrollingChat
        chat={chat}
        fetchMoreMessages={page =>
          messagesFetcher.submit({
            chatToken: chat.token,
            page,
          })
        }
        hasNextPage={hasNextPage}
        isFetchingNextPage={messagesFetcher.isLoading}
        messages={messages}
        onNavigateBack={() => navigate('/me/messages')}
        pagesPath={pagesPath}
        rightUserId={currentUser.userId}
      />
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
