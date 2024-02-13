import { Link as RemixLink } from '@remix-run/react';
import type { ComicForBrowse } from '~/types/types';
import { getTimeAgo } from '../admin.dashboard/route';
import Link from '~/ui-components/Link';

type ComicCardProps = {
  comic: ComicForBrowse;
};

export default function ComicCard({ comic }: ComicCardProps) {
  const url = TEMP_CARD_PICS[comic.id % TEMP_CARD_PICS.length];

  return (
    <div
      className="w-[160px] rounded overflow-hidden shadow dark:bg-gray-300 flex flex-col"
      key={comic.id}
    >
      <RemixLink to={`/${comic.name}`}>
        {/* Swap the below for SFW thumbnail */}
        {/* <img src="https://static-beta.yiffer.xyz/pi/ADADAD.webp" alt="comic thumbnail" /> */}
        <img src={url} alt="comic thumbnail" />
      </RemixLink>
      <div className="text-center p-1 flex flex-col items-center justify-between h-full">
        <Link href={`/${comic.name}`} text={comic.name} normalColor className="text-sm" />
        <Link
          href={`/artist/${comic.artistName}`}
          text={comic.artistName}
          className="text-sm"
        />
        <p className="text-xs">{comic.numberOfPages} pgs</p>
        <p className="text-xs">{getTimeAgo(comic.updated)}</p>
        <p className="text-xs">Etc.</p>
      </div>
    </div>
  );
}

export function SkeletonComicCard() {
  return <div className="w-[100px] h-[300px] rounded bg-gray-500" />;
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
