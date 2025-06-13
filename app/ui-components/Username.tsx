import { useState } from 'react';
import Link from './Link';
import { Link as RemixLink } from '@remix-run/react';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import { isModOrAdmin, type PublicUser } from '~/types/types';
import { R2_PROFILE_PICTURES_FOLDER } from '~/types/constants';
import { formatDistanceToNow } from 'date-fns';
import PublicProfileBadges from './PublicProfile/PublicProfileBadges';
import { FaUser } from 'react-icons/fa';
import { MdArrowForward } from 'react-icons/md';
import Button from './Buttons/Button';

export default function Username({
  id,
  username,
  overrideLink,
  fullUser,
  pagesPath,
  showRightArrow = true,
  textClassName = 'text-base',
  className = '',
}: {
  id: number;
  username: string;
  overrideLink?: string;
  fullUser?: PublicUser;
  pagesPath: string;
  showRightArrow?: boolean;
  textClassName?: string;
  className?: string;
}) {
  const [hasHoveredOnce, setHasHoveredOnce] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const fetcher = useGoodFetcher<PublicUser>({
    url: `/api/users/${id}`,
    method: 'get',
  });

  function onHover() {
    setIsHovering(true);
    if (hasHoveredOnce || fullUser) return;
    setHasHoveredOnce(true);
    fetcher.submit();
  }

  const user = fullUser ?? fetcher.data;

  const hasAnyBadges =
    user &&
    (isModOrAdmin({ userType: user.userType }) ||
      user.patreonDollars ||
      user.nationality);

  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={() => setIsHovering(false)}
      className={`w-fit relative inline ${className}`}
    >
      <Button
        text={username}
        variant="naked"
        style={{ marginTop: 0, padding: 0 }}
        className={'inline md:hidden ' + (textClassName ? `!${textClassName}` : '')}
      />
      <Link
        href={overrideLink ?? `/user/${username}`}
        text={username}
        showRightArrow={showRightArrow}
        isInsideParagraph
        className={'hidden md:inline ' + textClassName}
      />
      {isHovering && (
        <RemixLink
          to={`/user/${username}`}
          className={`flex absolute bg-white hover:bg-blue-strong-900 dark:bg-gray-100 dark:hover:bg-[#1a1b20]
                      rounded-md py-2 px-2.5 bottom-[100%] left-0 dark:!text-white
                      shadow-md dark:shadow-lg flex-row gap-2 items-center cursor-pointer z-10`}
        >
          <div className="rounded-full w-[64px] h-[64px]">
            {user?.profilePictureToken ? (
              <img
                src={`${pagesPath}/${R2_PROFILE_PICTURES_FOLDER}/${user.profilePictureToken}.jpg`}
                alt="Avatar"
                className="rounded-full h-[64px] w-[64px] bg-gray-875 dark:bg-gray-700"
                width={64}
                height={64}
              />
            ) : (
              <div className="rounded-full w-[64px] h-[64px] bg-gray-875 dark:bg-gray-700 flex items-center justify-center">
                {user ? (
                  <FaUser className="text-2xl sm:text-3xl text-gray-700 dark:text-gray-400" />
                ) : (
                  <Spinner />
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col justify-evenly h-[64px]">
            <p className="font-semibold">{username}</p>
            {hasAnyBadges && (
              <div className="flex flex-row gap-y-1 gap-x-4 text-sm">
                <PublicProfileBadges user={user} />
              </div>
            )}
            {user ? (
              <p className="text-sm text-nowrap">
                Member for {formatDistanceToNow(user.createdTime)}
              </p>
            ) : (
              <p className="text-sm pr-12 text-nowrap">Member for...</p>
            )}
          </div>

          {showRightArrow && (
            <MdArrowForward
              className="text-blue-weak-200 dark:text-blue-strong-100 font-bold md:hidden block"
              size={20}
            />
          )}
        </RemixLink>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <div
      className={`w-5 h-5 animate-spin border-solid border-transparent border
                border-r-gray-700 dark:border-r-gray-400 border-r-2 rounded-full`}
    />
  );
}
