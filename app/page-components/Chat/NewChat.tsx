import { useNavigate, useOutletContext, useSearchParams } from 'react-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { MAX_MESSAGE_LENGTH } from '~/types/constants';
import type {
  UserBlockStatus,
  Chat,
  UserSession,
  MinimalUserWithAllowMessages,
} from '~/types/types';
import IconButton from '~/ui-components/Buttons/IconButton';
import ProfilePicture from '../ProfilePicture';
import TextInput from '~/ui-components/TextInput/TextInput';
import Username from '~/ui-components/Username';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import { IoSend } from 'react-icons/io5';

export default function NewChat({
  currentUser,
  onCreateChat,
  pagesPath,
  messagesBasePath,
  isSending,
}: {
  currentUser: UserSession | null; // null = system
  onCreateChat: (message: string, toUserId: number) => void;
  pagesPath: string;
  messagesBasePath: string;
  isSending: boolean;
}) {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const toUserId = searchParams.get('toUserId');
  const { chats } = useOutletContext<{ chats: Chat[] }>();

  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [blockStatus, setBlockStatus] = useState<UserBlockStatus>(null);
  const [selectedUserData, setSelectedUserData] =
    useState<MinimalUserWithAllowMessages | null>(null);

  // @ts-ignore
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const system = currentUser === null;
  const blockNewMsgs = !system && !selectedUserData?.allowMessages;

  const searchUserFetcher = useGoodFetcher<MinimalUserWithAllowMessages[]>({
    url: '/api/search-users',
    method: 'POST',
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

  const checkBlockStatusFetcher = useGoodFetcher<UserBlockStatus>({
    url: '/api/get-block-status',
    method: 'POST',
    onFinish: () => {
      if (
        !checkBlockStatusFetcher.isError &&
        checkBlockStatusFetcher.data !== undefined
      ) {
        setBlockStatus(checkBlockStatusFetcher.data);
      }
    },
  });

  // Filter out current user
  const searchUserData = useMemo(() => {
    if (!searchUserFetcher.data) {
      return undefined;
    }
    return searchUserFetcher.data?.filter(user => user.id !== currentUser?.userId);
  }, [searchUserFetcher.data, currentUser]);

  useEffect(() => {
    if (!toUserId || searchUserFetcher.isLoading) return;

    checkBlockStatusFetcher.submit({ otherUserId: toUserId });

    let found = false;
    // Normal flow: search has already fetched the list, just find the user in it.
    if (searchUserData) {
      const user = searchUserData.find(u => u.id === parseInt(toUserId));
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

  function onSubmit() {
    if (!toUserId || message.length === 0 || message.length > MAX_MESSAGE_LENGTH) {
      return;
    }

    onCreateChat(message.trim(), Number(toUserId));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    }
  }

  function selectUser(user: MinimalUserWithAllowMessages) {
    setBlockStatus(null);

    if (toUserId === user.id.toString()) {
      setSearchQuery('');
      return;
    }

    const existingChat = chats.find(chat =>
      chat.members.some(member => member.id === user.id)
    );
    if (existingChat) {
      navigate(`${messagesBasePath}/${existingChat.token}`);
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
          onClick={() => navigate(messagesBasePath)}
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
            {searchUserData?.map((user, index) => (
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
            {blockNewMsgs && <p>This user has disabled new messages.</p>}
          </div>

          {blockStatus === null ? (
            <div className="p-3 flex flex-row gap-2 items-center">
              <textarea
                rows={6}
                className="w-full bg-gray-900 dark:bg-gray-400 rounded-sm px-3 py-2"
                placeholder="Write a message..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSending || blockNewMsgs}
              />
              <IconButton
                icon={IoSend}
                variant="naked"
                className="w-9! h-8! text-xl"
                onClick={onSubmit}
                disabled={
                  isSending || message.length > MAX_MESSAGE_LENGTH || blockNewMsgs
                }
              />
            </div>
          ) : (
            <div className="px-3 pb-4 pt-2">
              <p className="text-red-strong-200 dark:text-red-strong-300 text-sm font-semibold text-center">
                {blockStatus === 'both-blocked' &&
                  'You have mutually blocked each other.'}
                {blockStatus === 'blocked' && 'You have blocked this user.'}
                {blockStatus === 'blocked-by' && 'This user has blocked you.'}
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
      )}
    </>
  );
}
