import type { LoaderFunctionArgs, MetaFunction } from 'react-router';
import { redirect, useLoaderData } from 'react-router';
import { processApiError } from '~/utils/request-helpers';
import { redirectIfNotAdmin } from '~/utils/loaders';
import { getChat } from '~/route-funcs/get-chat';
import ScrollingChat from '~/page-components/Chat/ScrollingChat';
import { useEffect, useMemo, useState } from 'react';
import type { ChatMessage } from '~/types/types';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import TopGradientBox from '~/ui-components/TopGradientBox';
import useWindowSize from '~/utils/useWindowSize';
export { AdminErrorBoundary as ErrorBoundary } from '~/utils/error';

const topSitePartHeight = 170;

export const meta: MetaFunction = () => {
  return [{ title: `Mod: Chat | Yiffer.xyz` }];
};

export async function loader(args: LoaderFunctionArgs) {
  await redirectIfNotAdmin(args);
  const chatToken = args.params.token;

  if (!chatToken) return redirect('/admin/chat-list');

  const res = await getChat({
    db: args.context.cloudflare.env.DB,
    isModOrAdmin: true,
    chatToken,
    markReadIfAppropriate: false,
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
    pagesPath: args.context.cloudflare.env.PAGES_PATH,
    hasNextPage: res.result.hasNextPage,
  };
}

export default function SingleChatPage() {
  const { height } = useWindowSize();

  const {
    chat,
    messages: page1Messages,
    blockedStatus,
    pagesPath,
    hasNextPage: page1HasNextPage,
  } = useLoaderData<typeof loader>();

  const [messages, setMessages] = useState<ChatMessage[]>(page1Messages);
  const [hasNextPage, setHasNextPage] = useState(page1HasNextPage);
  const [messagesHeight, setMessagesHeight] = useState(0);

  useEffect(() => {
    if (!height) return;
    setMessagesHeight(height - topSitePartHeight);
  }, [height]);

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

  const blockedStatusText = useMemo(() => {
    if (blockedStatus === 'both-blocked') {
      return 'Users have mutually blocked each other';
    }
    if (blockedStatus === 'blocked-by') {
      return `${chat.members[1].username} has blocked ${chat.members[0].username}`;
    }
    if (blockedStatus === 'blocked') {
      return `${chat.members[0].username} has blocked ${chat.members[1].username}`;
    }
    return null;
  }, [blockedStatus, chat.members]);

  return (
    <div className="max-w-6xl">
      <h1 className="mb-1">Chat</h1>

      <TopGradientBox
        innerClassName="flex flex-col"
        containerClassName="mt-2"
        style={{ height: messagesHeight }}
      >
        <ScrollingChat
          chat={chat}
          messages={messages}
          hasNextPage={hasNextPage}
          isFetchingNextPage={messagesFetcher.isLoading}
          fetchMoreMessages={page =>
            messagesFetcher.submit({
              chatToken: chat.token,
              page,
            })
          }
          rightUserId={chat.members[0].id}
          pagesPath={pagesPath}
          isInAdminPanel
        />

        {blockedStatusText && (
          <p className="font-semibold text-red-strong-200 text-center my-2">
            {blockedStatusText}
          </p>
        )}
      </TopGradientBox>
    </div>
  );
}
