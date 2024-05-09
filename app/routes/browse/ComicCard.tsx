import { Link as RemixLink } from '@remix-run/react';
import type { ComicForBrowse } from '~/types/types';
import Link from '~/ui-components/Link';
import { useUIPreferences } from '~/utils/theme-provider';
import { IoDocumentOutline } from 'react-icons/io5';
import { FaRegStar } from 'react-icons/fa';
import { LuRefreshCcw } from 'react-icons/lu';
import { getTimeAgoShort } from '~/utils/date-utils';
import { FaPercent } from 'react-icons/fa6';
import { useBrowseParams } from './SearchFilter/useBrowseParams';
import { differenceInDays } from 'date-fns';

type ComicCardProps = {
  comic: ComicForBrowse;
};

export default function ComicCard({ comic }: ComicCardProps) {
  const url = TEMP_CARD_PICS[comic.id % TEMP_CARD_PICS.length];
  const { viewMode, comicCardTags } = useUIPreferences();
  const { tagIDs, addTagID } = useBrowseParams();

  const isNewComic = differenceInDays(new Date(), new Date(comic.published)) < 14;

  return (
    <div
      className={`w-[160px] rounded overflow-hidden shadow bg-white dark:bg-gray-300
                  flex flex-col relative
                  ${comicCardTags ? 'h-fit' : ''}`}
      key={comic.id}
    >
      <RemixLink to={`/${comic.name}`}>
        {/* Swap the below for SFW thumbnail */}
        {/* <img
          src="https://static-beta.yiffer.xyz/pi/ADADAD.webp"
          alt="comic thumbnail"
          style={{ height: 226 }}
          height={226}
        /> */}
        <img src={url} alt="comic thumbnail" style={{ height: 226 }} height={226} />
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
        <Link href={`/${comic.name}`} text={comic.name} normalColor className="text-sm" />
        <Link
          href={`/artist/${comic.artistName}`}
          text={comic.artistName}
          className="text-sm"
        />

        {viewMode !== 'Minimal' && (
          <>
            <div className="flex flex-row justify-evenly mx-auto w-full mt-1">
              <div className="w-9 flex flex-col items-center" title="Pages">
                <IoDocumentOutline size={14} className="-mb-0.5" />
                <label className="text-sm">{comic.numberOfPages}</label>
              </div>
              {comic.sumStars > 0 && (
                <>
                  <div
                    className="w-9 flex flex-col items-center"
                    title="Number of stars (popularity)"
                  >
                    <FaRegStar size={14} className="-mb-0.5" />
                    <label className="text-sm">{comic.sumStars}</label>
                  </div>
                  <div
                    className="w-9 flex flex-col items-center"
                    title="Average stars per rating, 1-3 (enjoyment)"
                  >
                    <FaPercent size={14} className="-mb-0.5" />
                    <label className="text-sm">{comic.avgStarsPercent}</label>
                  </div>
                </>
              )}
              <div className="w-9 flex flex-col items-center" title="Last updated">
                <LuRefreshCcw size={14} className="-mb-0.5" />
                <label className="text-sm">{getTimeAgoShort(comic.updated, false)}</label>
              </div>
            </div>
          </>
        )}

        {comic.tags?.length && comicCardTags && (
          <div className="w-full flex flex-row flex-wrap gap-x-1 gap-y-1 items-center justify-center mt-1.5 mb-1">
            {comic.tags.map(tag => {
              const isTagFiltered = tagIDs.includes(tag.id);
              const colorsStyle = isTagFiltered
                ? 'text-theme1-darker dark:text-theme1-dark dark:border-theme1-dark hover:shadow-none hover:border-gray-900'
                : 'text-gray-500 dark:text-gray-900 dark:border-gray-500 border-gray-900';

              return (
                <div
                  key={tag.id}
                  onClick={() => addTagID(tag.id)}
                  role="button"
                  className={`px-1.5 py-[1px] rounded-full leading-0 cursor-pointer hover:shadow
                            border border-gray-900  transition-all duration-75 dark:duration-0
                            w-fit text-gray-500 hover:text-theme1-darker
                            dark:text-gray-900 dark:hover:text-theme1-dark dark:border-gray-500
                            hover:border-transparent dark:hover:border-theme1-dark
                            ${colorsStyle}`}
                >
                  <span className="text-xs">{tag.name}</span>
                </div>
              );
            })}
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

const TEMP_CARD_PICS = [
  'https://static.yiffer.xyz/comics/Predators%20of%20Kilimanjaro/thumbnail.webp',
  'https://static.yiffer.xyz/comics/Burning%20Curiosity/thumbnail.webp',
  'https://static.yiffer.xyz/comics/PhanPhan%20Phantasies%20-%20Chapter%201/thumbnail.webp',
  'https://static.yiffer.xyz/comics/Double%20Trouble/thumbnail.webp',
  'https://static.yiffer.xyz/comics/The%20Roadwars/thumbnail.webp',
  'https://static.yiffer.xyz/comics/Comic%20Relief/thumbnail.webp',
  'https://static.yiffer.xyz/comics/Undertail%20Love%20or%20be%20Loved/thumbnail.webp',
  'https://static.yiffer.xyz/comics/Beach%20Daze/thumbnail.webp',
  'https://static.yiffer.xyz/comics/Rocket%20Cock/thumbnail.webp',
  'https://static.yiffer.xyz/comics/The%20Silk%20Sash/thumbnail.webp',
  'https://static.yiffer.xyz/comics/Breeder%20Season/thumbnail.webp',
  'https://static.yiffer.xyz/comics/Night%20Mares%204/thumbnail.webp',
  'https://static.yiffer.xyz/comics/Weekend/thumbnail.webp',
  'https://static.yiffer.xyz/comics/Interns%20Vol%203/thumbnail.webp',
  'https://static.yiffer.xyz/comics/Strapped%20In/thumbnail.webp',
  'https://static.yiffer.xyz/comics/Wishes%203/thumbnail.webp',
  'https://static.yiffer.xyz/comics/Little%20Red%20(Pokilewd)/thumbnail.webp',
  'https://static.yiffer.xyz/comics/Gay%20by%20Play/thumbnail.webp',
  'https://static.yiffer.xyz/comics/Heavy%20Lifting%20(SigmaX)/thumbnail.webp',
  'https://static.yiffer.xyz/comics/Outside%20the%20Box%20Ch.%202/thumbnail.webp',
  'https://static.yiffer.xyz/comics/The%20Right%20Size/thumbnail.webp',
  'https://static.yiffer.xyz/comics/Loona%20Comic/thumbnail.webp',
  'https://static.yiffer.xyz/comics/A%20Show%20of%20the%20Ropes/thumbnail.webp',
  'https://static.yiffer.xyz/comics/Movie%20Night%20(Jishinu)/thumbnail.webp',
  'https://static.yiffer.xyz/comics/Business%20Casual/thumbnail.webp',
  'https://static.yiffer.xyz/comics/Not%20So%20Little%20Red%202/thumbnail.webp',
  'https://static.yiffer.xyz/comics/Entangled/thumbnail.webp',
  'https://static.yiffer.xyz/comics/CinderFrost/thumbnail.webp',
  'https://static.yiffer.xyz/comics/Shedding%20Inhibitions%20-%20Chapter%208/thumbnail.webp',
  'https://static.yiffer.xyz/comics/Table%20For%20Three%202/thumbnail.webp',
  'https://static.yiffer.xyz/comics/Ancient%20Relic%20Adventure%20-%20%20Chapter%201/thumbnail.webp',
];
