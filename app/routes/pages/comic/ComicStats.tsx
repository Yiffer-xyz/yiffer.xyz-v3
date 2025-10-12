import { format } from 'date-fns';
import { type HTMLAttributes } from 'react';
import { AiOutlinePlus } from 'react-icons/ai';
import { IoChatbubbleEllipsesOutline, IoDocumentsOutline, IoStar } from 'react-icons/io5';
import { LuRefreshCcw } from 'react-icons/lu';
import type { Comic } from '~/types/types';
import { DESKTOP_COMICSTATS_WIDTH } from '~/types/constants';

type ComicStatsProps = {
  comic: Comic;
  className?: HTMLAttributes<HTMLDivElement>['className'];
};

export default function ComicStats({ comic, className = '' }: ComicStatsProps) {
  return (
    <div
      className={`flex flex-col mt-2 shrink-0 items-end gap-1.5 pl-3 
        md:pl-0 md:absolute md:right-0 text-sm md:text-base ${className}`}
      style={{ width: DESKTOP_COMICSTATS_WIDTH }}
    >
      <div className="flex flex-row items-center">
        <IoDocumentsOutline className="mt-[1.5px] mr-0.5" size={13} />
        <p>{comic.numberOfPages}</p>

        <IoChatbubbleEllipsesOutline className="mt-[1.5px] mr-0.5 ml-2.5" size={13} />
        <p>{comic.comments.length}</p>
      </div>

      <div className="flex flex-row items-center gap-1.5">
        <IoStar className="text-gray-600 dark:text-gray-700 mt-[2px]" />
        <p>
          {comic.sumStars
            ? `${comic.sumStars} (avg ${roundToOneDecimal(
                comic.sumStars / comic.numTimesStarred
              )})`
            : '0'}
        </p>
      </div>

      {comic.published && (
        <div className="flex flex-row items-center gap-1.5" title="Published">
          <AiOutlinePlus className="mt-[1.5px]" />
          <p>{format(comic.published, 'PP')}</p>
        </div>
      )}

      {comic.updated && comic.updated !== comic.published && (
        <div className="flex flex-row items-center gap-1.5" title="Updated">
          <LuRefreshCcw className="mt-[3px] mr-px" size={13} />
          <p>{format(comic.updated, 'PP')}</p>
        </div>
      )}
    </div>
  );
}

function roundToOneDecimal(num: number) {
  return Math.round(num * 10) / 10;
}
