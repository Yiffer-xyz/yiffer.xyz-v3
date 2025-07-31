import { FaUser } from 'react-icons/fa';
import type { MinimalUser } from '~/types/types';
import { R2_PROFILE_PICTURES_FOLDER } from '~/types/constants';
import type { HTMLAttributes } from 'react';

export default function ProfilePicture({
  user,
  pagesPath,
  className,
}: {
  user?: MinimalUser | null;
  pagesPath: string;
  className?: HTMLAttributes<HTMLDivElement>['className'];
}) {
  return (
    <div className={`${className}`}>
      {user?.profilePictureToken ? (
        <img
          src={`${pagesPath}/${R2_PROFILE_PICTURES_FOLDER}/${user?.profilePictureToken}.jpg`}
          alt={'User avatar'}
          className={`rounded-md ${className}`}
        />
      ) : (
        <div
          className={`rounded-md bg-gray-875 dark:bg-gray-700 flex items-center justify-center ${className}`}
        >
          <FaUser className="text-2xl sm:text-3xl text-gray-700 dark:text-gray-400" />
        </div>
      )}
    </div>
  );
}
