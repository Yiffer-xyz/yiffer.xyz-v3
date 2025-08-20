import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { redirect, useLoaderData, useNavigate } from '@remix-run/react';
import { useState } from 'react';
import { IoSend } from 'react-icons/io5';
import ScrollingChat from '~/page-components/Chat/ScrollingChat';
import { getChat } from '~/route-funcs/get-chat';
import { MAX_MESSAGE_LENGTH } from '~/types/constants';
import IconButton from '~/ui-components/Buttons/IconButton';
import { redirectIfNotAdmin } from '~/utils/loaders';
import { processApiError } from '~/utils/request-helpers';
import { useGoodFetcher } from '~/utils/useGoodFetcher';

export async function loader(args: LoaderFunctionArgs) {
  const currentUser = await redirectIfNotAdmin(args);
  const chatToken = args.params.token;
  if (!chatToken) {
    return redirect('/admin/system-chats');
  }

  const res = await getChat({
    db: args.context.cloudflare.env.DB,
    isModOrAdmin: true,
    chatToken: chatToken,
    markReadIfAppropriate: true,
    getBlockedStatus: false,
    page: 1,
    getFullChatIgnorePagination: true,
  });

  if (res.err) {
    return processApiError('Error getting system chat', res.err);
  }

  const { chat, messages } = res.result;

  messages.reverse();

  return {
    chat,
    messages,
    currentUser,
    pagesPath: args.context.cloudflare.env.PAGES_PATH,
  };
}

export default function MessageChat() {
  const navigate = useNavigate();
  const { chat, messages, pagesPath } = useLoaderData<typeof loader>();

  const [message, setMessage] = useState('');

  const sendMessageFetcher = useGoodFetcher({
    url: '/api/send-chat-message',
    method: 'post',
  });

  async function onSendMessage() {
    if (message.length === 0) {
      return;
    }

    await sendMessageFetcher.awaitSubmit({
      chatToken: chat.token,
      message: message.trim(),
      isFromSystem: true,
    });

    setMessage('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      onSendMessage();
    }
  }

  return (
    <>
      <ScrollingChat
        chat={chat}
        hasNextPage={false}
        isFetchingNextPage={false}
        messages={messages}
        onNavigateBack={() => navigate('/admin/system-chats')}
        pagesPath={pagesPath}
        rightUserId={null}
      />

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

      {message.length >= MAX_MESSAGE_LENGTH && (
        <p className="text-sm text-red-strong-200 font-semibold ml-4 mb-3 -mt-1">
          {message.length}/{MAX_MESSAGE_LENGTH} characters
        </p>
      )}
    </>
  );
}
