import { format, formatDistanceToNow } from 'date-fns';
import { FaUser } from 'react-icons/fa';
import { isModOrAdmin, type PublicUser } from '~/types/types';
import { MdCameraAlt, MdEdit } from 'react-icons/md';
import { getSocialUrl, R2_PROFILE_PICTURES_FOLDER } from '~/types/constants';
import Button from '../Buttons/Button';
import Link from '../Link';
import PublicProfileBadges from './PublicProfileBadges';

export default function PublicProfile({
  user,
  pagesPath,
  canEdit,
  onEdit,
  onChangePhoto,
  isAdminPanel,
  className,
}: {
  user: PublicUser;
  pagesPath: string;
  canEdit: boolean;
  onEdit: () => void;
  onChangePhoto: () => void;
  isAdminPanel?: boolean;
  className?: string;
}) {
  const hasAnyBadges =
    isModOrAdmin({ userType: user.userType }) || user.patreonDollars || user.nationality;

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

        <div className="flex flex-col gap-1 flex-shrink">
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

            <p>
              Joined {format(user.createdTime, 'PP')} (
              {formatDistanceToNow(user.createdTime)})
            </p>
          </div>
        </div>
      </div>

      {canEdit && (
        <div className="mt-4 mb-4 flex flex-row gap-2">
          {(!isAdminPanel || !!user.profilePictureToken) && (
            <Button
              text={user.profilePictureToken ? 'Change photo' : 'Set photo'}
              onClick={onChangePhoto}
              startIcon={MdCameraAlt}
            />
          )}
          <Button text="Edit profile" onClick={onEdit} startIcon={MdEdit} />
        </div>
      )}

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
    </div>
  );
}
