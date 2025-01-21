import type { HTMLAttributes } from 'react';
import { useMemo } from 'react';
import { useDevicePixelRatio } from 'use-device-pixel-ratio';
import type { AdForViewing } from '~/types/types';
import Link from '~/ui-components/Link';
import { randomString } from '~/utils/general';
import { useUIPreferences } from '~/utils/theme-provider';
import { useGoodFetcher } from '~/utils/useGoodFetcher';

type AdComicCardProps = {
  ad: AdForViewing;
  adsPath: string;
  minimal?: boolean;
  bypassCache?: boolean;
  className?: HTMLAttributes<HTMLDivElement>['className'];
};

export default function AdComicCard({
  ad,
  adsPath,
  minimal,
  bypassCache,
  className,
}: AdComicCardProps) {
  const { comicCardTags } = useUIPreferences();
  const devicePixelRatio = useDevicePixelRatio({ defaultDpr: 2 });
  const multiplier = useMemo(() => (devicePixelRatio > 2 ? 3 : 2), [devicePixelRatio]);

  const logClickFetcher = useGoodFetcher({
    url: '/api/log-click',
    method: 'post',
  });

  function onClick() {
    if (minimal) return;
    logClickFetcher.submit({ adId: ad.id });
  }

  const height = minimal ? 113 : 226;
  const width = minimal ? 80 : 160;
  const widthClassName = minimal ? 'w-[80px]' : 'w-[160px]';
  const queryStr = bypassCache ? `?q=${randomString(3)}` : '';

  return (
    <div
      className={`${widthClassName} rounded overflow-hidden bg-white dark:bg-gray-300
                  flex flex-col relative ${minimal ? '' : 'shadow'}
                  ${comicCardTags || minimal ? 'h-fit' : ''} ${className}`}
      style={{ minHeight: height }}
      key={ad.id}
    >
      <a
        href={ad.link}
        target="_blank"
        rel="noreferrer"
        onClick={onClick}
        style={{ height, width }}
      >
        {ad.mediaType === 'image' && (
          <picture style={{ height, width }}>
            <source
              srcSet={`${adsPath}/${ad.id}-${multiplier}x.webp${queryStr}`}
              type="image/webp"
              height={height}
              width={width}
            />
            <img
              src={`${adsPath}/${ad.id}-${multiplier}x.jpg${queryStr}`}
              alt="Advertisement"
              height={height}
              width={width}
            />
          </picture>
        )}

        {ad.mediaType === 'gif' && (
          <img
            src={`${adsPath}/${ad.id}-1x.gif${queryStr}`}
            style={{ maxWidth: width, maxHeight: height, width: 'auto', height: 'auto' }}
            width={width}
            height={height}
            alt="Ad"
          />
        )}

        {(ad.mediaType === 'gif' || ad.mediaType === 'video') && (
          <video
            width={width}
            height={height}
            autoPlay
            loop
            muted
            playsInline
            style={{ width, height }}
          >
            {ad.videoSpecificFileType ? (
              <source
                src={`${adsPath}/${ad.id}-1x.${ad.videoSpecificFileType}${queryStr}`}
                type={`video/${ad.videoSpecificFileType}`}
                style={{ width, height }}
              />
            ) : (
              <>
                <source
                  src={`${adsPath}/${ad.id}-1x.webm${queryStr}`}
                  type="video/webm"
                  style={{ width, height }}
                />
                <source
                  src={`${adsPath}/${ad.id}-1x.mp4${queryStr}`}
                  type="video/mp4"
                  style={{ width, height }}
                />
              </>
            )}
          </video>
        )}
      </a>

      {!minimal && (
        <>
          <AdCorner />

          <div className="text-center py-1 px-1 flex flex-col items-center justify-evenly h-full">
            <div>
              <Link
                href={ad.link}
                text={ad.mainText ?? ''}
                color="text"
                className="text-sm"
                newTab
              />
            </div>
            {ad.secondaryText && <p className="text-sm">{ad.secondaryText}</p>}
          </div>
        </>
      )}
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
