import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import {
  Outlet,
  useLoaderData,
  useNavigate,
  useParams,
  Link as RemixLink,
} from '@remix-run/react';
import { useEffect, useState } from 'react';
import { FaUser } from 'react-icons/fa';
import { getMessages } from '~/route-funcs/get-messages';
import { R2_PROFILE_PICTURES_FOLDER } from '~/types/constants';
import type { Chat } from '~/types/types';
import Breadcrumbs from '~/ui-components/Breadcrumbs/Breadcrumbs';
import ProfilePicture from '~/ui-components/ProfilePicture/ProfilePicture';
import TopGradientBox from '~/ui-components/TopGradientBox';
import { getTimeAgoShort } from '~/utils/date-utils';
import { redirectIfNotLoggedIn } from '~/utils/loaders';
import { processApiError } from '~/utils/request-helpers';
import useWindowSize from '~/utils/useWindowSize';

export async function loader(args: LoaderFunctionArgs) {
  const user = await redirectIfNotLoggedIn(args);

  // const messagesRes = await getMessages({
  //   currentUser: user,
  //   page: 1,
  //   db: args.context.cloudflare.env.DB,
  // });

  // if (messagesRes.err) {
  //   return processApiError('Error in /messages', messagesRes.err);
  // }
  // if (messagesRes.unauthorized) {
  //   return new Response('Unauthorized', { status: 401 });
  // }

  // return messagesRes.messages;

  const chats: Chat[] = [
    {
      id: 1,
      isRead: false,
      isSystemChat: false,
      latestMessage: {
        id: 1,
        senderId: 1,
        timestamp: new Date('2025-07-30T01:00:00Z'),
        content: 'Hello, how are you?',
      },
      members: [
        {
          id: 1,
          username: 'Malann',
          profilePictureToken: 'MoxtfiyTTLGzlyVZfYjtcCkG',
        },
        {
          id: 88526,
          username: 'testname',
          profilePictureToken: 'MoxtfiyTTLGzlyVZfYjtcCkG',
        },
      ],
    },
    {
      id: 2,
      isRead: true,
      isSystemChat: false,
      latestMessage: {
        id: 2,
        senderId: 98654,
        timestamp: new Date('2025-07-26T05:00:00Z'),
        content: 'Bla bla bla bla bla blabla bla bla blabla bla bla blabla bla bla bla?',
      },
      members: [
        {
          id: 1,
          username: 'Malann',
          profilePictureToken: 'MoxtfiyTTLGzlyVZfYjtcCkG',
        },
        {
          id: 98654,
          username: 'Melon',
          profilePictureToken: null,
        },
      ],
    },
  ];

  return { chats, currentUser: user, pagesPath: args.context.cloudflare.env.PAGES_PATH };
}

// Hacky
const topSitePartHeight = 170;

export default function Messages() {
  const navigate = useNavigate();

  const { chats, currentUser, pagesPath } = useLoaderData<typeof loader>();

  const { chatId: chatIdParam } = useParams();
  const chatId = chatIdParam ? parseInt(chatIdParam) : null;

  const { height } = useWindowSize();

  const [messagesHeight, setMessagesHeight] = useState(0);

  useEffect(() => {
    if (!height) return;
    setMessagesHeight(height - topSitePartHeight - 16);
  }, [height]);

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
            className={`flex flex-col md:border-r md:border-gray-900 dark:border-gray-500 w-full md:w-[240px]`}
          >
            {chats.map(chat => {
              const maybeOtherMember = chat.members.find(
                member => member.id !== currentUser.userId
              );

              return (
                <RemixLink
                  key={chat.id}
                  className={`cursor-pointer py-3 px-3 ${chatId === chat.id ? 'bg-theme1-primaryTrans' : ''}`}
                  to={`/me/messages/${chat.id}`}
                >
                  <div className="flex flex-row gap-2 w-full">
                    <ProfilePicture
                      user={maybeOtherMember}
                      pagesPath={pagesPath}
                      className="w-12 h-12"
                    />
                    <div className="overflow-hidden flex-grow">
                      <div className="flex flex-row gap-1 items-end justify-between w-full">
                        <p className="font-semibold">
                          {maybeOtherMember?.username ?? 'SYSTEM'}
                        </p>
                        <p className="text-sm">
                          {getTimeAgoShort(chat.latestMessage.timestamp)}
                        </p>
                      </div>
                      <p className="text-sm truncate">{chat.latestMessage.content}</p>
                    </div>
                  </div>
                </RemixLink>
              );
            })}
          </div>

          <div
            className={`${chatId ? 'hidden md:block' : ''} overflow-y-scroll
          scrollbar scrollbar-thumb-theme1-primary scrollbar-track-theme1-primaryTrans
          `}
          >
            <Outlet />
          </div>
        </TopGradientBox>
      )}
    </div>
  );
}
