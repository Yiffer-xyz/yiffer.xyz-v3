import { FaUser } from 'react-icons/fa';
import type { MinimalUser } from '~/types/types';
import { R2_PROFILE_PICTURES_FOLDER } from '~/types/constants';
import type { HTMLAttributes } from 'react';

export default function ProfilePicture({
  user,
  pagesPath,
  iconSizeClassName: iconSizeClassNameParam,
  className,
}: {
  user?: MinimalUser | null;
  pagesPath: string;
  iconSizeClassName?: HTMLAttributes<HTMLDivElement>['className'];
  className?: HTMLAttributes<HTMLDivElement>['className'];
}) {
  const iconSizeClassName = iconSizeClassNameParam ?? 'text-2xl sm:text-3xl';

  return (
    <div className={`${className}`}>
      {user?.profilePictureToken ? (
        // No idea why the <img> won't size properly on its own, but it doesn't. Wrap div around = works.
        <div className={`${className}`}>
          <img
            src={`${pagesPath}/${R2_PROFILE_PICTURES_FOLDER}/${user?.profilePictureToken}.jpg`}
            alt={'User avatar'}
            className={`rounded-md ${className}`}
          />
        </div>
      ) : (
        <>
          {user ? (
            <div
              className={`rounded-md bg-gray-875 dark:bg-gray-700 flex items-center justify-center ${className}`}
            >
              <FaUser
                className={`${iconSizeClassName} text-gray-700 dark:text-gray-400`}
              />
            </div>
          ) : (
            <div
              className={`rounded-md bg-theme1-primary flex flex-col items-center justify-center ${className}`}
            >
              <p
                style={{ fontFamily: 'Shrikhand,cursive' }}
                className="text-2xl -mb-1 -ml-0.5 text-text-light"
              >
                Y
              </p>
              <p className="text-[10px] font-semibold text-text-light">SYSTEM</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
