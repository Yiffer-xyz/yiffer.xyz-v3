import { Link as RemixLink } from '@remix-run/react';
import type { CardAdForViewing } from '~/types/types';
import Link from '~/ui-components/Link';
import { useUIPreferences } from '~/utils/theme-provider';

type AdComicCardProps = {
  ad: CardAdForViewing;
  adsPath: string;
};

export default function AdComicCard({ ad, adsPath }: AdComicCardProps) {
  const { comicCardTags } = useUIPreferences();

  return (
    <div
      className={`w-[160px] rounded overflow-hidden shadow bg-white dark:bg-gray-300
                  flex flex-col relative
                  ${comicCardTags ? 'h-fit' : ''}`}
      key={ad.id}
    >
      <RemixLink to={ad.link} target="_blank">
        <picture style={{ height: 226 }}>
          <source srcSet={`${adsPath}/${ad.id}-3x.webp`} type="image/webp" height={226} />
          <img src={`${adsPath}/${ad.id}-3x.jpg`} alt="Advertisement" height={226} />
        </picture>
      </RemixLink>

      <AdCorner />

      <div className="text-center py-1 px-1 flex flex-col items-center justify-evenly h-full">
        <div>
          <Link
            href={ad.link}
            text={ad.mainText}
            color="text"
            className="text-sm"
            newTab
          />
        </div>
        {ad.secondaryText && <p className="text-sm">{ad.secondaryText}</p>}
      </div>
    </div>
  );
}

export function SkeletonComicCard() {
  return <div className="w-[100px] h-[300px] rounded bg-gray-500" />;
}

function AdCorner() {
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
          <label className={`font-bold mb-1 text-sm`}>AD</label>
        </div>
      </div>
    </div>
  );
}
