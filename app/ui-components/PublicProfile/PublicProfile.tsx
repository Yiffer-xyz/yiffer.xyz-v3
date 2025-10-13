import { format, formatDistanceToNowStrict } from 'date-fns';
import { FaUser } from 'react-icons/fa';
import { isModOrAdmin, type PublicUser } from '~/types/types';
import { MdBlock, MdCameraAlt, MdEdit, MdMessage } from 'react-icons/md';
import { getSocialUrl, R2_PROFILE_PICTURES_FOLDER } from '~/types/constants';
import Link from '../Link';
import PublicProfileBadges from './PublicProfileBadges';
import { RiShieldFill } from 'react-icons/ri';
import { useNavigate } from 'react-router';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import type { ListButtonItem } from '../ListButtons';
import ListButtons from '../ListButtons';
import { useCallback, useMemo, useEffect, useState } from 'react';

export default function PublicProfile({
  user,
  pagesPath,
  canEdit,
  onEdit,
  onChangePhoto,
  isAdminPanel,
  showModLinkType,
  isLoggedIn,
  className,
}: {
  user: PublicUser;
  pagesPath: string;
  canEdit: boolean;
  onEdit: () => void;
  onChangePhoto: () => void;
  isAdminPanel?: boolean;
  showModLinkType?: 'admin-panel' | 'public-profile';
  isLoggedIn: boolean;
  className?: string;
}) {
  const navigate = useNavigate();

  const blockFetcher = useGoodFetcher({
    url: '/api/block-user',
    method: 'POST',
  });

  // Client-side date formatting to avoid hydration mismatch
  const [joinedDate, setJoinedDate] = useState<string>('');
  const [joinedTimeAgo, setJoinedTimeAgo] = useState<string>('');

  useEffect(() => {
    // Format dates on client side to avoid hydration mismatch
    setJoinedDate(format(user.createdTime, 'PP'));
    setJoinedTimeAgo(formatDistanceToNowStrict(user.createdTime));
  }, [user.createdTime]);

  const hasAnyBadges =
    isModOrAdmin({ userType: user.userType }) || user.patreonDollars || user.nationality;

  const isUserBlocked =
    user.currentUserBlockStatus === 'blocked' ||
    user.currentUserBlockStatus === 'both-blocked';

  const onMessage = useCallback(() => {
    if (!isLoggedIn) {
      navigate('/login?redirect=/user/' + user.username);
      return;
    }
    if (user.chatTokenWithCurrentUser) {
      navigate(`/me/messages/${user.chatTokenWithCurrentUser}`);
    } else {
      navigate(`/me/messages/new?toUserId=${user.id}`);
    }
  }, [isLoggedIn, navigate, user]);

  const onToggleBlock = useCallback(() => {
    const action = isUserBlocked ? 'unblock' : 'block';
    blockFetcher.submit({
      targetUserId: user.id,
      action,
    });
  }, [blockFetcher, isUserBlocked, user]);

  const listButtonItems = useMemo(() => {
    let buttons: ListButtonItem[] = [];

    if (canEdit) {
      buttons = [
        {
          title: 'Profile picture',
          text: user.profilePictureToken ? 'Change photo' : 'Set photo',
          onClick: onChangePhoto,
          Icon: MdCameraAlt,
        },
        {
          title: 'Profile info',
          text: 'Edit profile',
          onClick: onEdit,
          Icon: MdEdit,
        },
      ];
    } else {
      buttons.push({
        title: 'Chat',
        text: `Message ${user.username}`,
        onClick: onMessage,
        Icon: MdMessage,
        disabled: isUserBlocked,
      });
      if (isLoggedIn) {
        buttons.push({
          text: isUserBlocked ? `Unblock ${user.username}` : `Block ${user.username}`,
          onClick: onToggleBlock,
          Icon: MdBlock,
          disabled: blockFetcher.isLoading,
          color: isUserBlocked ? 'normal' : 'error',
        });
      }
    }

    if (showModLinkType) {
      if (showModLinkType === 'admin-panel') {
        buttons.push({
          text: 'View in admin panel',
          onClick: () => {
            navigate(`/admin/users/${user.id}`);
          },
          Icon: RiShieldFill,
        });
      } else {
        buttons.push({
          text: 'View public profile',
          onClick: () => {
            navigate(`/user/${user.username}`);
          },
          Icon: FaUser,
        });
      }
    }

    return buttons;
  }, [
    blockFetcher.isLoading,
    canEdit,
    isUserBlocked,
    onChangePhoto,
    onEdit,
    onMessage,
    onToggleBlock,
    user,
    navigate,
    showModLinkType,
    isLoggedIn,
  ]);

  return (
    <div className={className}>
      <div className="flex flex-row items-start gap-3">
        {user.profilePictureToken ? (
          <img
            src={`${pagesPath}/${R2_PROFILE_PICTURES_FOLDER}/${user.profilePictureToken}.jpg`}
            alt="Avatar"
            className="rounded h-[120px] w-[120px] sm:h-[160px] sm:w-[160px] bg-gray-800 mt-2"
          />
        ) : (
          <div className="rounded h-[120px] w-[120px] p-2 sm:p-0 sm:h-[160px] sm:w-[160px] bg-gray-800 mt-2 flex flex-col gap-2 pt-2 items-center justify-center">
            <FaUser className="text-5xl sm:text-6xl" color="#666" />
            <p className="text-xs sm:text-sm text-gray-400 text-center">
              No profile picture
            </p>
          </div>
        )}

        <div className="flex flex-col gap-1 shrink">
          {isAdminPanel ? <h2>{user.username}</h2> : <h1>{user.username}</h1>}
          <div className="flex flex-col gap-1 text-sm sm:text-base">
            {hasAnyBadges && (
              <div className="flex flex-row gap-y-1 gap-x-4 flex-wrap">
                <PublicProfileBadges user={user} />
              </div>
            )}

            {user.contributionPoints ? (
              <p>{user.contributionPoints} contribution points</p>
            ) : null}

            <p>Joined {joinedDate ? `${joinedDate} (${joinedTimeAgo})` : ''}</p>
          </div>
        </div>
      </div>

      {user.bio && (
        <>
          <p className="font-semibold mt-4">Bio</p>
          <div>
            <p className="text-sm whitespace-pre-wrap">{user.bio}</p>
          </div>
        </>
      )}

      {user.socialLinks.length > 0 && (
        <div className="mt-4">
          <p className="font-semibold">Social links</p>
          <div className="flex flex-col text-sm gap-y-1 mt-1">
            {user.socialLinks.map(link => {
              const fullUrl = getSocialUrl(link.platform, link.username);
              return (
                <div className="flex flex-row gap-1 items-center" key={link.platform}>
                  <img
                    src={`${pagesPath}/website-images/${link.platform.toLowerCase()}.png`}
                    alt={link.platform}
                    className="w-4 h-4"
                  />
                  <Link
                    newTab
                    href={fullUrl}
                    text={fullUrl
                      .replace('https://', '')
                      .replace('http://', '')
                      .replace('www.', '')}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      <ListButtons className="mt-6 mb-4" items={listButtonItems} />
    </div>
  );
}
