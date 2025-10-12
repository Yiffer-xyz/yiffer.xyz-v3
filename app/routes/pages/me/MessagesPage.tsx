import type { LoaderFunctionArgs, MetaFunction } from 'react-router';
import { useLoaderData, useParams, useLocation, useRevalidator } from 'react-router';
import { useEffect, useState } from 'react';
import { getChatList } from '~/route-funcs/get-chat-list';
import Breadcrumbs from '~/ui-components/Breadcrumbs';
import { redirectIfNotLoggedIn } from '~/utils/loaders';
import { processApiError } from '~/utils/request-helpers';
import FullChatBox from '~/page-components/Chat/FullChatBox';

export const meta: MetaFunction = () => {
  return [{ title: `Messages | Yiffer.xyz` }];
};

export async function loader(args: LoaderFunctionArgs) {
  const user = await redirectIfNotLoggedIn(args);

  const messagesRes = await getChatList({
    db: args.context.cloudflare.env.DB,
    systemChatMode: 'include',
    clearChatNotification: true,
    userId: user.userId,
  });

  if (messagesRes.err) {
    return processApiError('Error in /me/messages', messagesRes.err);
  }

  return {
    chats: messagesRes.result,
    currentUser: user,
    pagesPath: args.context.cloudflare.env.PAGES_PATH,
  };
}

// Hacky
const topSitePartHeight = 170;

export default function Messages() {
  const { chatId: chatIdParam } = useParams();
  const isCreatingNewChat = useLocation().pathname.includes('/new');
  const chatId = isCreatingNewChat ? null : chatIdParam ? chatIdParam : null;
  const revalidator = useRevalidator();

  useEffect(() => {
    const interval = setInterval(() => {
      revalidator.revalidate();
    }, 30_000);
    return () => clearInterval(interval);
  }, [revalidator]);

  const { chats, currentUser, pagesPath } = useLoaderData<typeof loader>();

  const [overrideChatTokenToMessageIdRead, setOverrideChatTokenToMessageIdRead] =
    useState<{
      [token: string]: number;
    }>({});

  // If chatId is selected, and it was your own unread, mark it read
  // (it'll be done in the loader of the chat page, this is just getting the list UI up to date)
  useEffect(() => {
    if (!chatId) return;
    const chat = chats.find(chat => chat.token === chatId);
    if (!chat) return;

    if (chat.latestMessage?.senderId !== currentUser.userId && !chat.isRead) {
      if (overrideChatTokenToMessageIdRead[chatId] !== chat.latestMessage?.id) {
        setOverrideChatTokenToMessageIdRead(prev => ({
          ...prev,
          [chatId]: chat.latestMessage?.id ?? 0,
        }));
      }
    }
  }, [chatId, chats, currentUser.userId, overrideChatTokenToMessageIdRead]);

  return (
    <div className="container mx-auto">
      <h1>Messages</h1>

      <Breadcrumbs prevRoutes={[{ text: 'Me', href: '/me' }]} currentRoute="Messages" />

      <FullChatBox
        chats={chats}
        currentUser={currentUser}
        messagesBasePath="/me/messages"
        pagesPath={pagesPath}
        topSitePartHeight={topSitePartHeight}
      />
    </div>
  );
}
