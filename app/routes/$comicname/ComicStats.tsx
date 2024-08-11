import { format } from 'date-fns';
import { AiOutlinePlus } from 'react-icons/ai';
import { IoDocumentOutline, IoStar } from 'react-icons/io5';
import { LuRefreshCcw } from 'react-icons/lu';
import type { Comic } from '~/types/types';
import { UTCTimeStrToLocalDate } from '~/utils/date-utils';

type ComicStatsProps = {
  comic: Comic;
};

export default function ComicStats({ comic }: ComicStatsProps) {
  return (
    <div
      className={`flex flex-col mt-2 flex-shrink-0 items-end gap-1.5 md:text-base pl-3
      md:flex-row md:gap-6 md:pl-0 md:w-fit md:mt-5`}
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
        <div className="flex flex-row items-center gap-1.5">
          <AiOutlinePlus className="mt-[1.5px]" />
          <p>{format(UTCTimeStrToLocalDate(comic.published), 'PP')}</p>
        </div>
      )}

      {comic.updated && (
        <div className="flex flex-row items-center gap-1.5">
          <LuRefreshCcw className="mt-[3px] mr-[1px]" size={13} />
          <p>{format(UTCTimeStrToLocalDate(comic.updated), 'PP')}</p>
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
