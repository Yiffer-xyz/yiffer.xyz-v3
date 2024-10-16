import { Link as RemixLink } from '@remix-run/react';
import type { ComicForBrowse } from '~/types/types';
import Link from '~/ui-components/Link';
import { useUIPreferences } from '~/utils/theme-provider';
import { IoDocumentOutline } from 'react-icons/io5';
import { FaRegStar } from 'react-icons/fa';
import { LuRefreshCcw } from 'react-icons/lu';
import { getTimeAgoShort } from '~/utils/date-utils';
import { FaBookmark } from 'react-icons/fa6';
import { useBrowseParams } from './SearchFilter/useBrowseParams';
import { differenceInDays } from 'date-fns';
import clsx from 'clsx';
import TagElement from '~/ui-components/TagElement/TagElement';
import { useDevicePixelRatio } from 'use-device-pixel-ratio';
import { useMemo } from 'react';

type ComicCardProps = {
  comic: ComicForBrowse;
  pagesPath: string;
  showStaticTags?: boolean;
  toggleBookmark?: (comicId: number) => void;
};

export default function ComicCard({
  comic,
  pagesPath,
  showStaticTags,
  toggleBookmark,
}: ComicCardProps) {
  const { comicCardTags } = useUIPreferences();
  const { tagIDs, addTagID } = useBrowseParams();
  const devicePixelRatio = useDevicePixelRatio({ defaultDpr: 2 });
  const multiplier = useMemo(() => (devicePixelRatio > 2 ? 3 : 2), [devicePixelRatio]);

  const isNewComic = differenceInDays(new Date(), comic.published) < 14;

  const showTags = comicCardTags || showStaticTags;

  return (
    <div
      className={`w-[160px] rounded overflow-hidden shadow bg-white dark:bg-gray-300
                  flex flex-col relative
                  ${showTags ? 'h-fit' : ''}`}
      key={comic.id}
    >
      <RemixLink to={`/${comic.name}`}>
        <img
          src={`${pagesPath}/${comic.name}/thumbnail-${multiplier}x.webp`}
          alt="comic thumbnail"
          style={{ height: 226 }}
          height={226}
        />
        {/* <div className="w-[160px] h-[226px] bg-gray-500" /> */}
      </RemixLink>

      <div
        className={`-mt-5 mx-auto bg-white px-2 pt-[1px] rounded-sm text-sm rounded-b-none
                    dark:bg-gray-300 dark:font-bold`}
      >
        <label>{comic.category}</label>
      </div>

      {comic.state !== 'finished' && <StateCorner state={comic.state} />}

      {isNewComic && <NewCorner />}

      <div className="text-center py-1 px-1 flex flex-col items-center justify-evenly h-full">
        <div className="leading-5 pt-0.5 pb-1">
          {comic.isBookmarked && toggleBookmark && (
            <button className="pr-1.5 group" onClick={() => toggleBookmark(comic.id)}>
              <FaBookmark
                size={14}
                className={`inline-block transition-all text-theme1-primary dark:text-theme1-darker 
                group-hover:text-theme1-darker2 dark:group-hover:text-theme1-primary`}
              />
            </button>
          )}
          <Link
            href={`/${comic.name}`}
            text={comic.name}
            color="text"
            className="text-sm leading-0"
          />
        </div>
        <Link
          href={`/artist/${comic.artistName}`}
          text={comic.artistName}
          className="text-sm"
        />

        <div className="flex flex-row justify-evenly mx-auto w-full mt-1">
          <div className="w-9 flex flex-col items-center" title="Pages">
            <IoDocumentOutline size={14} className="-mb-0.5" />
            <label className="text-sm">{comic.numberOfPages}</label>
          </div>
          {comic.sumStars > 0 && (
            <>
              <div
                className="w-9 flex flex-col items-center"
                title={`Number of stars (popularity)${
                  comic.yourStars ? ' & Your stars' : ''
                }`}
              >
                <FaRegStar
                  size={14}
                  className={clsx(
                    '-mb-0.5',
                    comic.yourStars && 'text-theme1-darker dark:text-theme1-dark'
                  )}
                />
                <div className="flex items-center">
                  <label className="text-sm">{comic.sumStars}</label>
                  {comic.yourStars && (
                    <label className="text-sm font-bold ml-1 text-theme1-darker dark:text-theme1-dark">
                      {comic.yourStars}
                    </label>
                  )}
                </div>
              </div>
              {/* <div
                    className="w-9 flex flex-col items-center"
                    title="Average stars per rating, 1-3 (enjoyment)"
                  >
                    <FaPercent size={14} className="-mb-0.5" />
                    <label className="text-sm">{comic.avgStarsPercent}</label>
                  </div> */}
            </>
          )}
          <div className="w-9 flex flex-col items-center" title="Last updated">
            <LuRefreshCcw size={14} className="-mb-0.5" />
            <label className="text-sm">{getTimeAgoShort(comic.updated, false)}</label>
          </div>
        </div>

        {showTags && comic.tags?.length && (
          <div className="w-full flex flex-row flex-wrap gap-x-1 gap-y-1 items-center justify-center mt-1.5 mb-1">
            {comic.tags.map(tag => (
              <TagElement
                tag={tag}
                isActive={!showStaticTags && tagIDs.includes(tag.id)}
                onClick={tagId => !showStaticTags && addTagID(tagId)}
                disableHoverEffects={showStaticTags}
                key={tag.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function SkeletonComicCard() {
  return <div className="w-[100px] h-[300px] rounded bg-gray-500" />;
}

function StateCorner({ state }: { state: 'cancelled' | 'wip' }) {
  return (
    <div className="absolute top-0 left-0">
      <div
        className={`border-solid 
              border-t-[60px] border-r-[60px] border-b-0 border-l-0
              border-t-white dark:border-t-gray-300 
              border-r-transparent border-b-transparent border-l-transparent
              flex items-center justify-center`}
      >
        <div
          className={`absolute h-[84px] w-[84px] -top-[41px] -left-[41px] 
                          flex items-end justify-center -rotate-45`}
        >
          <label className={`font-semibold mb-1 text-sm`}>
            {state === 'wip' && 'WIP'}
            {state === 'cancelled' && 'DEAD'}
          </label>
        </div>
      </div>
    </div>
  );
}

function NewCorner() {
  return (
    <div className="absolute top-0 right-0">
      <div
        className={`border-solid 
              border-t-[60px] border-l-[60px] border-b-0 border-r-0
              border-t-white dark:border-t-gray-300 
              border-r-transparent border-b-transparent border-l-transparent
              flex items-center justify-center`}
      >
        <div
          className={`absolute h-[84px] w-[84px] -top-[41px] -right-[41px] 
                          flex items-end justify-center rotate-45`}
        >
          <label className={`font-bold mb-1 text-sm`}>NEW</label>
        </div>
      </div>
    </div>
  );
}
