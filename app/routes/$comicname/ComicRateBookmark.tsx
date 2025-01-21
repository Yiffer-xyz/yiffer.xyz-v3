import { FaBookmark, FaRegBookmark } from 'react-icons/fa';
import { IoStar } from 'react-icons/io5';
import type { Comic, ComicForBrowse } from '~/types/types';
import { useNavigate } from '@remix-run/react';
import posthog from 'posthog-js';
import { useAuthRedirect } from '~/utils/general';
import { useMemo, useState } from 'react';
import { useGoodFetcher } from '~/utils/useGoodFetcher';

type ComicInfoProps = {
  comic: Comic | ComicForBrowse;
  isLoggedIn: boolean;
  small?: boolean;
  source: 'comic-page' | 'comic-card';
  className?: string;
};

export default function ComicRateBookmark({
  comic,
  isLoggedIn,
  small = false,
  source,
  className,
}: ComicInfoProps) {
  const yourStars = comic.yourStars ?? 0;
  const navigate = useNavigate();
  const { redirectSetOnLoginNavStr } = useAuthRedirect();

  const [overrideStars, setOverrideStars] = useState<number | null>(null);
  const [overrideBookmark, setOverrideBookmark] = useState<boolean | null>(null);
  const [hoverStars, setHoverStars] = useState<number | null>(null);

  const shownStars = overrideStars ?? yourStars;

  const updateYourStarsFetcher = useGoodFetcher({
    method: 'post',
    url: '/api/update-your-stars',
  });

  function onUpdateStars(stars: number) {
    if (!isLoggedIn) {
      navigate(`/login${redirectSetOnLoginNavStr}`);
      return;
    }

    posthog.capture('Comic rated', { source });

    const newStars =
      overrideStars === null
        ? yourStars === stars
          ? 0
          : stars
        : shownStars === stars
          ? 0
          : stars;

    updateYourStarsFetcher.submit({
      stars: newStars,
      comicId: comic.id,
    });
    setOverrideStars(newStars);
  }

  const toggleBookmarkFetcher = useGoodFetcher({
    method: 'post',
    url: '/api/toggle-bookmark',
  });

  function onToggleBookmark() {
    if (!isLoggedIn) {
      navigate(`/login${redirectSetOnLoginNavStr}`);
      return;
    }

    posthog.capture('Comic bookmark toggled', { source });
    toggleBookmarkFetcher.submit({
      comicId: comic!.id,
    });
    const newBookmark =
      overrideBookmark !== null ? !overrideBookmark : !comic.isBookmarked;
    setOverrideBookmark(newBookmark);
  }

  const unfilledColorClass = 'text-gray-700 dark:text-gray-800';
  const filledColorClass = 'text-theme1-dark dark:text-theme1-dark';
  const hoverClass =
    'group-hover:text-theme1-darker2 dark:group-hover:text-theme1-darker3';
  const hoverOtherStarFilledClass = 'text-theme1-darker2 dark:text-theme1-darker3';

  const starClassnames = useMemo(() => {
    if (hoverStars === null) {
      return [1, 2, 3].map(star =>
        shownStars >= star ? filledColorClass : unfilledColorClass
      );
    } else {
      return [1, 2, 3].map(star => {
        if (hoverStars === star) {
          return hoverClass;
        }
        if (hoverStars > star) {
          return hoverOtherStarFilledClass;
        }
        return unfilledColorClass;
      });
    }
  }, [hoverClass, hoverStars, shownStars]);

  return (
    <div className={`flex flex-row items-center ${className}`}>
      {/* Bookmark */}
      <button onClick={onToggleBookmark} className="p-2 -ml-2 group">
        {(overrideBookmark ?? comic.isBookmarked) ? (
          <FaBookmark
            size={small ? 16 : 20}
            className={`text-theme1-dark mt-[3px] ${hoverClass}`}
          />
        ) : (
          <FaRegBookmark
            size={small ? 16 : 20}
            className={`${unfilledColorClass} mt-[3px] group-hover:text-theme1-dark`}
          />
        )}
      </button>

      {/* Vertical divider div */}
      {!small && <div className="h-7 w-[0.5px] bg-gray-750 mx-1.5 mt-1" />}

      {/* Stars */}
      <div>
        <button
          onClick={() => onUpdateStars(1)}
          className="p-1 group"
          onMouseEnter={() => setHoverStars(1)}
          onMouseLeave={() => setHoverStars(null)}
        >
          <IoStar
            size={small ? 20 : 24}
            className={`${starClassnames[0]} transition-all duration-75`}
          />
        </button>
        <button
          onClick={() => onUpdateStars(2)}
          className="p-1 group"
          onMouseEnter={() => setHoverStars(2)}
          onMouseLeave={() => setHoverStars(null)}
        >
          <IoStar
            size={small ? 20 : 24}
            className={`${starClassnames[1]} transition-all duration-75`}
          />
        </button>
        <button
          onClick={() => onUpdateStars(3)}
          className="p-1 group"
          onMouseEnter={() => setHoverStars(3)}
          onMouseLeave={() => setHoverStars(null)}
        >
          <IoStar
            size={small ? 20 : 24}
            className={`${starClassnames[2]} transition-all duration-75`}
          />
        </button>
      </div>
    </div>
  );
}
