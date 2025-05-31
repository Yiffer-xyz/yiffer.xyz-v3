import { format, formatDistanceToNow } from 'date-fns';
import { FaPatreon, FaUser } from 'react-icons/fa';
import { RiShieldFill, RiShieldStarFill } from 'react-icons/ri';
import { isModOrAdmin, type PublicUser } from '~/types/types';
import { capitalizeFirstRestLower } from '~/utils/general';
import ReactCountryFlag from 'react-country-flag';
import { useEffect, useMemo, useState } from 'react';
import countryList from 'react-select-country-list';
import Link from '../Link';
import { MdCameraAlt, MdEdit, MdOpenInNew } from 'react-icons/md';
import { R2_PROFILE_PICTURES_FOLDER } from '~/types/constants';
import Button from '../Buttons/Button';

export default function PublicProfile({
  user,
  pagesPath,
  canEdit,
  onEdit,
  onChangePhoto,
}: {
  user: PublicUser;
  pagesPath: string;
  canEdit: boolean;
  onEdit: () => void;
  onChangePhoto: () => void;
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const countryName = useMemo(() => {
    if (!user.nationality) return null;
    return countryList()
      .getData()
      .find(c => c.value === user.nationality)?.label;
  }, [user.nationality]);

  const hasAnyBadges =
    isModOrAdmin({ userType: user.userType }) || user.patreonDollars || user.nationality;

  const isMod = user.userType === 'moderator';
  const isAdmin = user.userType === 'admin';

  const Icon = isAdmin ? RiShieldStarFill : isMod ? RiShieldFill : null;

  return (
    <>
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
          <h1>{user.username}</h1>
          <div className="flex flex-col gap-1 text-sm sm:text-base">
            {hasAnyBadges && (
              <div className="flex flex-row gap-y-1 gap-x-4 flex-wrap">
                {Icon && (
                  <div className="flex flex-row gap-1 items-center">
                    <Icon className="text-theme1-primary mt-0.5" />{' '}
                    <p>{capitalizeFirstRestLower(user.userType)}</p>
                  </div>
                )}
                {user.patreonDollars && (
                  <div className="flex flex-row gap-1 items-center">
                    <FaPatreon className="text-patreon-primary mt-0.5" />{' '}
                    <p>Patron (${user.patreonDollars})</p>
                  </div>
                )}
                {user.nationality && (
                  <div className="flex flex-row gap-1 items-center">
                    {isClient ? (
                      <ReactCountryFlag countryCode={user.nationality} />
                    ) : (
                      <div className="w-3.5" />
                    )}
                    <p>{countryName}</p>
                  </div>
                )}
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
          <Button
            text={user.profilePictureToken ? 'Change photo' : 'Set photo'}
            onClick={onChangePhoto}
            startIcon={MdCameraAlt}
          />
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

      {user.publicProfileLinks.length > 0 && (
        <div className="mt-4">
          <p className="font-semibold">Links</p>
          <div className="flex flex-col text-sm">
            {user.publicProfileLinks.map(link => (
              <Link href={link} newTab key={link} text={link} IconRight={MdOpenInNew} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
