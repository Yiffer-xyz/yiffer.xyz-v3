import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { FaUser } from 'react-icons/fa';
import { R2_PROFILE_PICTURES_FOLDER } from '~/types/constants';
import type { ChatMessage } from '~/types/types';
import ProfilePicture from '~/ui-components/ProfilePicture/ProfilePicture';
import Username from '~/ui-components/Username';
import { getTimeAgoShort } from '~/utils/date-utils';
import { redirectIfNotLoggedIn } from '~/utils/loaders';

export async function loader(args: LoaderFunctionArgs) {
  const user = await redirectIfNotLoggedIn(args);

  const chat = {
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
  };

  return {
    chat,
    messages,
    currentUser: user,
    pagesPath: args.context.cloudflare.env.PAGES_PATH,
  };
}

export default function Message() {
  const { chat, messages, currentUser, pagesPath } = useLoaderData<typeof loader>();

  const otherUser = chat.members.find(member => member.id !== currentUser.userId);

  return (
    <>
      <div
        className={`border-b border-b-gray-900 dark:border-b-gray-500 p-3 flex flex-col items-center
          sticky top-0 bg-white dark:bg-gray-300 z-10`}
      >
        {otherUser ? (
          <Username
            id={otherUser.id}
            username={otherUser.username}
            pagesPath={pagesPath}
            showRightArrow={false}
          />
        ) : (
          'SYSTEM MESSAGE'
        )}
      </div>

      <div className="p-3 flex flex-col gap-4">
        {messages.map(message => {
          const isMyMessage = message.fromUser?.id === currentUser.userId;

          return (
            <div
              key={message.id}
              className={`flex ${isMyMessage ? 'flex-row-reverse' : 'flex-row'} gap-2`}
            >
              <ProfilePicture
                user={message.fromUser}
                pagesPath={pagesPath}
                className="w-12 h-12"
              />
              <div className="max-w-[70%]">
                <p className="">{message.messageText}</p>
                <p className={`text-xs mt-1 ${isMyMessage ? 'text-right' : 'text-left'}`}>
                  {getTimeAgoShort(message.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

const messages: ChatMessage[] = [
  {
    id: 1,
    fromUser: { id: 88526, username: 'testname', profilePictureToken: null },
    timestamp: new Date('2025-07-30T01:00:00Z'),
    isSystemMessage: false,
    messageText:
      'Hello, howasd asd as dasd asda sdas dasd asd asd asd asda sda sdasd asdd asd you?',
    isRead: false,
  },
  {
    id: 2,
    fromUser: {
      id: 1,
      username: 'Malann',
      profilePictureToken: 'MoxtfiyTTLGzlyVZfYjtcCkG',
    },
    timestamp: new Date('2025-07-29T01:00:00Z'),
    isSystemMessage: false,
    messageText: 'Hello,asdasd asd  are you?',
    isRead: false,
  },
  {
    id: 3,
    fromUser: { id: 88526, username: 'testname', profilePictureToken: null },
    timestamp: new Date('2025-07-28T01:00:00Z'),
    isSystemMessage: false,
    messageText: 'Hello, how are you?',
    isRead: false,
  },
  {
    id: 4,
    fromUser: { id: 88526, username: 'testname', profilePictureToken: null },
    timestamp: new Date('2025-07-28T01:00:00Z'),
    isSystemMessage: false,
    messageText:
      'Hello, how are you?\nHello, how are you?\nHello, how are you?\nHello, how are you?\nHello, how are you?\nHello, how are you?\nHello, how are you?\nHello, how are you?\nHello, how are you?\nHello, how are you?\nHello, how are you?\nHello, how are you?\nHello, how are you?\nHello, how are you?\nHello, how are you?\nHello, how are you?\nHello, how are you?\nHello, how are you?\nHello, how are you?\nHello, how are you?\nHello, how are you?\n',
    isRead: false,
  },
  {
    id: 5,
    fromUser: {
      id: 1,
      username: 'Malann',
      profilePictureToken: 'MoxtfiyTTLGzlyVZfYjtcCkG',
    },
    timestamp: new Date('2025-07-28T01:00:00Z'),
    isSystemMessage: false,
    messageText: 'Hello, how are you?',
    isRead: false,
  },
  {
    id: 6,
    fromUser: { id: 88526, username: 'testname', profilePictureToken: null },
    timestamp: new Date('2025-07-28T01:00:00Z'),
    isSystemMessage: false,
    messageText:
      'Hello, how are\nsdasdasdasd asd asdkmalsd mlaksmd lkamsdl nasdkjna kjsdnjkansd kjansdkj najksdn akjsdnkjansd kansdkjnasdk jnjn you?',
    isRead: false,
  },
  {
    id: 7,
    fromUser: { id: 88526, username: 'testname', profilePictureToken: null },
    timestamp: new Date('2025-07-28T01:00:00Z'),
    isSystemMessage: false,
    messageText:
      'Hello, how are\nsdasdasdasd asd asdkmalsd mlaksmd lkamsdl nasdkjna kjsdnjkansd kjansdkj najksdn akjsdnkjansd kansdkjnasdk jnjn you?',
    isRead: false,
  },
];
