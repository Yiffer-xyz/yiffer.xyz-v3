import { Link as RemixLink } from '@remix-run/react';
import type { ComicForBrowse } from '~/types/types';
import { getTimeAgo } from '../admin.dashboard/route';
import Link from '~/ui-components/Link';

type ComicCardProps = {
  comic: ComicForBrowse;
};

export default function ComicCard({ comic }: ComicCardProps) {
  return (
    <div
      className="w-[160px] rounded overflow-hidden shadow dark:bg-gray-300"
      key={comic.id}
    >
      <RemixLink to={`/${comic.name}`}>
        <img src="https://static-beta.yiffer.xyz/pi/ADADAD.webp" alt="comic thumbnail" />
      </RemixLink>
      <div className="text-center p-1 flex flex-col items-center">
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
