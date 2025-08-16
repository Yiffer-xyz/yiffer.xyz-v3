import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/cloudflare';
import {
  redirect,
  useLoaderData,
  useNavigate,
  useOutletContext,
  useSearchParams,
} from '@remix-run/react';
import { useEffect, useRef, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { createChat } from '~/route-funcs/create-chat';
import { MAX_MESSAGE_LENGTH } from '~/types/constants';
import type { Chat } from '~/types/types';
import IconButton from '~/ui-components/Buttons/IconButton';
import ProfilePicture from '~/ui-components/ProfilePicture/ProfilePicture';
import TextInput from '~/ui-components/TextInput/TextInput';
import Username from '~/ui-components/Username';
import { redirectIfNotLoggedIn } from '~/utils/loaders';
import { create400Json, processApiError } from '~/utils/request-helpers';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import type { MinimalUserWithAllowMessages } from '../api.search-users';
import { IoSend } from 'react-icons/io5';

export async function loader(args: LoaderFunctionArgs) {
  const user = await redirectIfNotLoggedIn(args);

  return {
    currentUser: user,
    pagesPath: args.context.cloudflare.env.PAGES_PATH,
  };
}

export async function action(args: ActionFunctionArgs) {
  const currentUser = await redirectIfNotLoggedIn(args);
  const formData = await args.request.formData();
  const message = formData.get('message');
  const toUserIdStr = formData.get('toUserId');
  if (!message || !toUserIdStr) {
    return create400Json('Missing message or toUserId');
  }
  const toUserId = parseInt(toUserIdStr as string);
  if (isNaN(toUserId)) {
    return create400Json('Invalid toUserId');
  }

  const createChatResult = await createChat({
    db: args.context.cloudflare.env.DB,
    fromUserId: currentUser.userId,
    toUserId,
    message: message as string,
  });

  if (createChatResult.err) {
    return processApiError('Error creating chat', createChatResult.err);
  }

  const chatToken = createChatResult.result.chatToken;
  return redirect(`/me/messages/${chatToken}`);
}

export default function Message() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { pagesPath } = useLoaderData<typeof loader>();
  const { chats } = useOutletContext<{ chats: Chat[] }>();

  const toUserId = searchParams.get('toUserId');
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserData, setSelectedUserData] =
    useState<MinimalUserWithAllowMessages | null>(null);

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const searchUserFetcher = useGoodFetcher<MinimalUserWithAllowMessages[]>({
    url: '/api/search-users',
    method: 'post',
    onFinish: () => {
      // For when landing on the page from link with ?toUserId=xxx
      // Fetcher will fire, and should return one single result.
      if (searchUserFetcher.data && toUserId) {
        if (
          searchUserFetcher.data.length === 1 &&
          searchUserFetcher.data[0].id === parseInt(toUserId)
        ) {
          setSelectedUserData(searchUserFetcher.data[0]);
        }
      }
    },
  });

  const submitFetcher = useGoodFetcher({
    method: 'post',
  });

  useEffect(() => {
    if (!toUserId || searchUserFetcher.isLoading) return;

    let found = false;
    // Normal flow: search has already fetched the list, just find the user in it.
    if (searchUserFetcher.data) {
      const user = searchUserFetcher.data.find(u => u.id === parseInt(toUserId));
      if (user) {
        found = true;
        setSelectedUserData(user);
      }
    }

    // When landing via link with ?toUserId=xxx, fetch the user.
    if (!found) {
      setSelectedUserData(null);
      searchUserFetcher.submit({ searchIdQuery: toUserId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toUserId]);

  useEffect(() => {
    if (searchQuery.length < 2) return;

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      searchUserFetcher.submit({ searchQuery });
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  function onNavigateBack() {
    navigate('/me/messages');
  }

  function onSubmit() {
    if (!toUserId || message.length === 0 || message.length > MAX_MESSAGE_LENGTH) {
      return;
    }

    submitFetcher.submit({
      message: message.trim(),
      toUserId: toUserId,
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    }
  }

  function selectUser(user: MinimalUserWithAllowMessages) {
    if (toUserId === user.id.toString()) {
      setSearchQuery('');
      return;
    }

    const existingChat = chats.find(chat =>
      chat.members.some(member => member.id === user.id)
    );
    if (existingChat) {
      navigate(`/me/messages/${existingChat.token}`);
      return;
    }

    setSearchParams({ toUserId: user.id.toString() });
    setSearchQuery('');
  }

  return (
    <>
      <div
        className={`border-b border-b-gray-900 dark:border-b-gray-500 p-3 flex flex-row items-center justify-between h-12`}
      >
        <IconButton
          icon={FaArrowLeft}
          className="w-8"
          noPadding
          variant="naked"
          onClick={onNavigateBack}
        />
        <p>
          New chat
          {selectedUserData ? (
            <>
              {' with '}
              <Username
                id={selectedUserData.id}
                username={selectedUserData.username}
                pagesPath={pagesPath}
                showRightArrow={false}
                positionVertical="bottom"
                positionHorizontal="left"
              />
            </>
          ) : null}
        </p>
        <div className="w-8 h-1" />
      </div>

      {!toUserId && (
        <div className="mx-4 mt-2 overflow-hidden">
          <TextInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search for a user"
            className="mb-3"
          />

          <div className="grow min-h-[300px] overflow-y-auto overflow-hidden h-full flex flex-col gap-2 pb-4 scrollbar scrollbar-thumb-gray-850 scrollbar-track-white dark:scrollbar-track-gray-300">
            {searchUserFetcher.data?.map((user, index) => (
              <div
                key={user.id}
                className={`flex flex-row gap-2 items-center hover:bg-blue-more-trans 
                  cursor-pointer rounded-sm justify-between`}
                onClick={() => selectUser(user)}
              >
                <div className="flex flex-row gap-2 items-center">
                  <ProfilePicture
                    user={user}
                    pagesPath={pagesPath}
                    className="w-8 h-8"
                    iconSizeClassName="text-xl"
                  />
                  <Username
                    overrideLink="#"
                    id={user.id}
                    username={user.username}
                    pagesPath={pagesPath}
                    showRightArrow={false}
                    positionVertical={index <= 1 ? 'bottom' : 'top'}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!!toUserId && selectedUserData && (
        <>
          <div className="grow flex flex-col items-center justify-center p-4">
            {!selectedUserData.allowMessages && (
              <p>This user has disabled new messages.</p>
            )}
          </div>

          <div className="p-3 flex flex-row gap-2 items-center">
            <textarea
              rows={6}
              className="w-full bg-gray-900 dark:bg-gray-400 rounded-sm px-3 py-2"
              placeholder="Write a message..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={submitFetcher.isLoading || !selectedUserData.allowMessages}
            />
            <IconButton
              icon={IoSend}
              variant="naked"
              className="w-9! h-8! text-xl"
              onClick={onSubmit}
              disabled={
                submitFetcher.isLoading ||
                message.length > MAX_MESSAGE_LENGTH ||
                !selectedUserData.allowMessages
              }
            />
          </div>
          {message.length >= MAX_MESSAGE_LENGTH && (
            <p className="text-sm text-red-strong-200 font-semibold ml-4 mb-3 -mt-1">
              {message.length}/{MAX_MESSAGE_LENGTH} characters
            </p>
          )}
        </>
      )}
    </>
  );
}
