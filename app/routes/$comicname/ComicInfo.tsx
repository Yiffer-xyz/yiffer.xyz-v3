import { FaBookmark, FaRegBookmark } from 'react-icons/fa';
import { IoStar } from 'react-icons/io5';
import type { Comic } from '~/types/types';
import Link from '~/ui-components/Link';
import clsx from 'clsx';

type ComicInfoProps = {
  comic: Comic;
  updateStars: (stars: number) => void;
  toggleBookmark: () => void;
  isLoggedIn: boolean;
};

export default function ComicInfo({
  comic,
  updateStars,
  toggleBookmark,
  isLoggedIn,
}: ComicInfoProps) {
  const yourStars = comic.yourStars ?? 0;

  function onUpdateStars(stars: number) {
    if (!isLoggedIn) alert('Log in bro - todo make this nice');

    if (yourStars === stars) {
      updateStars(0);
    } else {
      updateStars(stars);
    }
  }

  function onToggleBookmark() {
    if (!isLoggedIn) alert('Log in bro - todo make this nice');
    toggleBookmark();
  }

  const unfilledColorClass = 'text-gray-750 dark:text-gray-700';
  const filledColorClass = 'text-theme1-dark dark:text-theme1-dark';
  const hoverClass = isLoggedIn
    ? 'group-hover:text-theme1-darker dark:group-hover:text-theme1-darker2'
    : '';

  return (
    <div className="px-4">
      <h1 className="text-4xl">{comic.name}</h1>
      <p>
        by{' '}
        <Link
          href={`/artist/${comic.artist.name}`}
          text={comic.artist.name}
          isInsideParagraph
        />
      </p>

      <div className="flex flex-row items-center mt-4">
        {/* Bookmark */}
        <button onClick={onToggleBookmark} className="p-2 -ml-2 group">
          {comic.isBookmarked ? (
            <FaBookmark size={22} className={`text-theme1-dark mt-[3px] ${hoverClass}`} />
          ) : (
            <FaRegBookmark
              size={22}
              className={`text-gray-700 mt-[3px] ${
                isLoggedIn ? 'group-hover:text-theme1-dark' : ''
              }`}
            />
          )}
        </button>

        {/* Vertical divider div */}
        <div className="h-8 w-[1px] bg-gray-700 mx-2" />

        {/* Stars */}
        <button onClick={() => onUpdateStars(1)} className="p-1 group">
          <IoStar
            size={28}
            className={clsx(
              yourStars >= 1 ? filledColorClass : unfilledColorClass,
              hoverClass
            )}
          />
        </button>
        <button onClick={() => onUpdateStars(2)} className="p-1 group">
          <IoStar
            size={28}
            className={clsx(
              yourStars >= 2 ? filledColorClass : unfilledColorClass,
              hoverClass
            )}
          />
        </button>
        <button onClick={() => onUpdateStars(3)} className="p-1 group">
          <IoStar
            size={28}
            className={clsx(
              yourStars >= 3 ? filledColorClass : unfilledColorClass,
              hoverClass
            )}
          />
        </button>
      </div>
    </div>
  );
}
