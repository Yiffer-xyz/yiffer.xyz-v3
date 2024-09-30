import { format } from 'date-fns';
import { type HTMLAttributes } from 'react';
import { AiOutlinePlus } from 'react-icons/ai';
import { IoDocumentOutline, IoStar } from 'react-icons/io5';
import { LuRefreshCcw } from 'react-icons/lu';
import type { Comic } from '~/types/types';
import { desktopStatsWidth } from './route';

type ComicStatsProps = {
  comic: Comic;
  className?: HTMLAttributes<HTMLDivElement>['className'];
};

export default function ComicStats({ comic, className = '' }: ComicStatsProps) {
  return (
    <div
      className={`flex flex-col mt-2 flex-shrink-0 items-end gap-1.5 pl-3 
        md:pl-0 md:absolute md:right-0 ${className}`}
      style={{ width: desktopStatsWidth }}
    >
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
          <LuRefreshCcw className="mt-[3px] mr-[1px]" size={13} />
          <p>{format(comic.updated, 'PP')}</p>
        </div>
      )}

      <div className="flex flex-row items-center gap-1.5">
        <IoDocumentOutline className="mt-[1.5px]" size={13} />
        <p>{comic.numberOfPages} pages</p>
      </div>
    </div>
  );
}

function roundToOneDecimal(num: number) {
  return Math.round(num * 10) / 10;
}
