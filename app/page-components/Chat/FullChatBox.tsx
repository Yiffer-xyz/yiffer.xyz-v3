import {
  Outlet,
  useLocation,
  useNavigate,
  Link as RemixLink,
  useParams,
  useRevalidator,
} from '@remix-run/react';
import { useEffect, useMemo, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { GoDotFill } from 'react-icons/go';
import { RiCheckDoubleLine } from 'react-icons/ri';
import type { Chat, UserSession } from '~/types/types';
import Button from '~/ui-components/Buttons/Button';
import IconButton from '~/ui-components/Buttons/IconButton';
import ProfilePicture from '~/ui-components/ProfilePicture/ProfilePicture';
import TopGradientBox from '~/ui-components/TopGradientBox';
import { getTimeAgoShort } from '~/utils/date-utils';
import useWindowSize from '~/utils/useWindowSize';

export default function FullChatBox({
  chats,
  topSitePartHeight, // hacky!
  messagesBasePath, // /me/messages or /admin/system-chats
  currentUser,
  pagesPath,
}: {
  chats: Chat[];
  topSitePartHeight: number;
  messagesBasePath: string;
  currentUser: UserSession | null; // null = system
  pagesPath: string;
}) {
  const navigate = useNavigate();
  const { height } = useWindowSize();
  const revalidator = useRevalidator();
  const { token } = useParams();

  const isCreatingNewChat = useLocation().pathname.includes('/new');
  const chatId = isCreatingNewChat ? null : token ? token : null;

  const [messagesHeight, setMessagesHeight] = useState(0);
  const [search, setSearch] = useState('');

  const system = !currentUser;

  useEffect(() => {
    if (!height) return;
    setMessagesHeight(height - topSitePartHeight);
  }, [height, topSitePartHeight]);

  const filteredChats = useMemo(() => {
    return chats.filter(chat => {
      return chat.members.some(member =>
        member.username.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [chats, search]);

  useEffect(() => {
    const interval = setInterval(() => {
      revalidator.revalidate();
    }, 30_000);
    return () => clearInterval(interval);
  }, [revalidator]);

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

    if (chat.latestMessage?.senderId !== null && !chat.isRead) {
      if (overrideChatTokenToMessageIdRead[chatId] !== chat.latestMessage?.id) {
        setOverrideChatTokenToMessageIdRead(prev => ({
          ...prev,
          [chatId]: chat.latestMessage?.id ?? 0,
        }));
      }
    }
  }, [chatId, chats, overrideChatTokenToMessageIdRead]);

  // Hacky - window height isn't defined when SSR, so delay till first render on client
  if (!messagesHeight) return null;

  return (
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
              onClick={() => navigate(`${messagesBasePath}/new`)}
            />
          )}
        </div>

        {filteredChats.map(chat => {
          const maybeOtherMember = system
            ? chat.members[0]
            : chat.members.find(member => member.id !== currentUser.userId);

          const isOverrideRead =
            overrideChatTokenToMessageIdRead[chat.token] === chat.latestMessage?.id;
          const isUnreadByCurrentUser =
            !isOverrideRead &&
            !chat.isRead &&
            (system
              ? chat.latestMessage?.senderId !== null
              : chat.latestMessage?.senderId !== currentUser.userId);
          const isReadByOtherUser =
            chat.isRead &&
            (system
              ? chat.latestMessage?.senderId === null
              : chat.latestMessage?.senderId === currentUser.userId);

          return (
            <RemixLink
              key={chat.token}
              className={`cursor-pointer py-3 px-3 ${chatId === chat.token ? 'bg-theme1-primary-trans' : ''}`}
              to={`${messagesBasePath}/${chat.token}`}
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
                      {maybeOtherMember?.username ?? 'System messages'}
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
                    {(system
                      ? chat.latestMessage?.senderId === null
                      : chat.latestMessage?.senderId === currentUser.userId) && 'You: '}
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
              onClick={() => navigate(`${messagesBasePath}/new`)}
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
            onClick={() => navigate(`${messagesBasePath}/new`)}
          />
        </div>
      </div>
    </TopGradientBox>
  );
}
