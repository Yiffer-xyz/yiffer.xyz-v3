import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import {
  Outlet,
  useLoaderData,
  useNavigate,
  useParams,
  Link as RemixLink,
  useLocation,
  useRevalidator,
} from '@remix-run/react';
import { useEffect, useMemo, useState } from 'react';
import { FaPlus } from 'react-icons/fa6';
import { getChatList } from '~/route-funcs/get-chat-list';
import Breadcrumbs from '~/ui-components/Breadcrumbs/Breadcrumbs';
import Button from '~/ui-components/Buttons/Button';
import IconButton from '~/ui-components/Buttons/IconButton';
import ProfilePicture from '~/ui-components/ProfilePicture/ProfilePicture';
import TopGradientBox from '~/ui-components/TopGradientBox';
import { getTimeAgoShort } from '~/utils/date-utils';
import { redirectIfNotLoggedIn } from '~/utils/loaders';
import { processApiError } from '~/utils/request-helpers';
import useWindowSize from '~/utils/useWindowSize';
import { GoDotFill } from 'react-icons/go';
import { RiCheckDoubleLine } from 'react-icons/ri';

export async function loader(args: LoaderFunctionArgs) {
  const user = await redirectIfNotLoggedIn(args);

  const messagesRes = await getChatList(
    args.context.cloudflare.env.DB,
    user.userId,
    true
  );

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
  const navigate = useNavigate();
  const { chatId: chatIdParam } = useParams();
  const isCreatingNewChat = useLocation().pathname.includes('/new');
  const chatId = isCreatingNewChat ? null : chatIdParam ? chatIdParam : null;
  const { height } = useWindowSize();
  const revalidator = useRevalidator();

  useEffect(() => {
    const interval = setInterval(() => {
      revalidator.revalidate();
    }, 30_000);
    return () => clearInterval(interval);
  }, [revalidator]);

  const { chats, currentUser, pagesPath } = useLoaderData<typeof loader>();

  const [messagesHeight, setMessagesHeight] = useState(0);
  const [search, setSearch] = useState('');
  const [overrideChatTokenToMessageIdRead, setOverrideChatTokenToMessageIdRead] =
    useState<{
      [token: string]: number;
    }>({});

  const filteredChats = useMemo(() => {
    return chats.filter(chat => {
      return chat.members.some(member =>
        member.username.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [chats, search]);

  useEffect(() => {
    if (!height) return;
    setMessagesHeight(height - topSitePartHeight);
  }, [height]);

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

      {/* Hacky - window height isn't defined when SSR, so delay till first render on client */}
      {messagesHeight > 0 && (
        <TopGradientBox
          innerClassName="flex flex-row h-full"
          style={{ height: messagesHeight }}
        >
          <div
            className={`flex flex-col md:border-r md:border-gray-900 dark:border-gray-500 shrink-0
              w-full md:w-[300px] 2xl:w-[340px] ${chatId || isCreatingNewChat ? 'hidden md:flex' : 'flex'}
              overflow-y-auto overflow-hidden scrollbar scrollbar-thumb-gray-850 dark:scrollbar-thumb-gray-600 scrollbar-track-white dark:scrollbar-track-gray-300
            `}
          >
            <div className="flex flex-row gap-2 items-center px-3 pt-3 mb-3">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search chats"
                name="search"
                className="w-full bg-gray-900 dark:bg-gray-400 px-3 py-2 rounded-sm mr-1"
                autoComplete="off"
              />
              {chats.length > 0 && (
                <IconButton
                  icon={FaPlus}
                  variant="naked"
                  className="text-[16px] md:hidden"
                  onClick={() => navigate('/me/messages/new')}
                />
              )}
            </div>
            {filteredChats.map(chat => {
              const maybeOtherMember = chat.members.find(
                member => member.id !== currentUser.userId
              );

              const isOverrideRead =
                overrideChatTokenToMessageIdRead[chat.token] === chat.latestMessage?.id;
              const isUnreadByCurrentUser =
                !isOverrideRead &&
                chat.latestMessage?.senderId !== currentUser.userId &&
                !chat.isRead;
              const isReadByOtherUser =
                chat.latestMessage?.senderId === currentUser.userId && chat.isRead;

              return (
                <RemixLink
                  key={chat.token}
                  className={`cursor-pointer py-3 px-3 ${chatId === chat.token ? 'bg-theme1-primary-trans' : ''}`}
                  to={`/me/messages/${chat.token}`}
                >
                  <div className="flex flex-row gap-2 w-full">
                    <ProfilePicture
                      user={maybeOtherMember}
                      pagesPath={pagesPath}
                      className="w-12 h-12"
                    />
                    <div className="overflow-hidden grow">
                      <div className="flex flex-row gap-1 items-end justify-between w-full">
                        <p className="font-semibold truncate">
                          {isUnreadByCurrentUser && (
                            <GoDotFill className="text-theme1-dark dark:text-theme1-primary mr-0 -ml-1" />
                          )}
                          {maybeOtherMember?.username ?? 'SYSTEM'}
                          {isReadByOtherUser && (
                            <RiCheckDoubleLine className="text-sm mr-0 ml-1 text-gray-750 dark:text-gray-750" />
                          )}
                        </p>
                        <p
                          className={`text-sm shrink-0 ${isUnreadByCurrentUser ? 'font-semibold' : ''}`}
                        >
                          {chat.latestMessage?.timestamp &&
                            getTimeAgoShort(chat.latestMessage.timestamp, false)}
                        </p>
                      </div>
                      <p
                        className={`text-sm truncate ${isUnreadByCurrentUser ? 'font-semibold' : ''}`}
                      >
                        {chat.latestMessage?.senderId === currentUser.userId && 'You: '}
                        {chat.latestMessage?.content}
                      </p>
                    </div>
                  </div>
                </RemixLink>
              );
            })}

            {chats.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full pb-20">
                <p className="text-sm text-center text-gray-600 dark:text-gray-750">
                  You don't have any chats yet.
                </p>
                <Button
                  text="New chat"
                  className="mt-2 md:hidden"
                  startIcon={FaPlus}
                  onClick={() => navigate('/me/messages/new')}
                />
              </div>
            )}
          </div>

          <div
            className={`${chatId || isCreatingNewChat ? 'flex' : 'hidden md:flex'} grow flex-col
          `}
          >
            <Outlet context={{ chats }} />
            <div
              className={`${chatId || isCreatingNewChat ? 'hidden' : 'hidden md:flex'} 
                w-full h-full gap-3 flex-col items-center justify-center`}
            >
              {chats.length > 0 && (
                <p className="text-sm">Select a chat to start messaging, or:</p>
              )}
              <Button
                text="New chat"
                startIcon={FaPlus}
                onClick={() => navigate('/me/messages/new')}
              />
            </div>
          </div>
        </TopGradientBox>
      )}
    </div>
  );
}
