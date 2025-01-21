import { type HTMLAttributes } from 'react';
import { ADVERTISEMENTS } from '~/types/constants';
import type { AdForViewing } from '~/types/types';
import { randomString } from '~/utils/general';
import { useGoodFetcher } from '~/utils/useGoodFetcher';

type Props = {
  ad: AdForViewing;
  adsPath: string;
  excludeClickLogging?: boolean;
  bypassCache?: boolean;
  overrideWidth?: number;
  className?: HTMLAttributes<HTMLAnchorElement>['className'];
};

export default function Ad({
  ad,
  adsPath,
  excludeClickLogging,
  bypassCache,
  overrideWidth,
  className,
}: Props) {
  const fullAd = ADVERTISEMENTS.find(fullAd => fullAd.name === ad.adType);

  const logClickFetcher = useGoodFetcher({
    url: '/api/log-click',
    method: 'post',
  });

  if (!fullAd) return null;

  function onClick() {
    if (excludeClickLogging) return;
    logClickFetcher.submit({ adId: ad.id });
  }

  let { width, height } = fullAd.minDimensions;
  const queryStr = bypassCache ? `?q=${randomString(3)}` : '';

  if (overrideWidth) {
    const aspectRatio = width / height;
    const newHeight = overrideWidth / aspectRatio;
    height = newHeight;
  }

  const displayHeight = ad.adType === 'banner' ? undefined : height;

  return (
    <a
      href={ad.link}
      target="_blank"
      rel="noreferrer"
      className={`block w-fit ${className ?? ''} rounded overflow-hidden`}
      onClick={onClick}
    >
      {ad.mediaType === 'image' && (
        <picture
          style={{
            maxHeight: fullAd.minDimensions.height,
          }}
        >
          <source
            srcSet={`${adsPath}/${ad.id}-2x.webp${queryStr}`}
            type="image/webp"
            width={overrideWidth ?? undefined}
            height={displayHeight}
            style={{
              width: overrideWidth ?? undefined,
              height: displayHeight,
              maxHeight: fullAd.minDimensions.height,
            }}
          />
          <img
            src={`${adsPath}/${ad.id}-2x.jpg${queryStr}`}
            alt="illustration"
            width={overrideWidth ?? undefined}
            height={displayHeight}
            style={{
              width: overrideWidth ?? undefined,
              height: displayHeight,
              maxHeight: fullAd.minDimensions.height,
            }}
          />
        </picture>
      )}

      {ad.mediaType === 'gif' && (
        <img
          src={`${adsPath}/${ad.id}-1x.gif${queryStr}`}
          style={{
            maxHeight: Math.min(displayHeight ?? 9999, fullAd.minDimensions.height),
          }}
          alt="Ad"
        />
      )}

      {ad.mediaType === 'video' && (
        <video
          height={displayHeight}
          style={{
            width: overrideWidth ?? undefined,
            height: displayHeight,
            maxHeight: fullAd.minDimensions.height,
          }}
          autoPlay
          loop
          muted
          playsInline
        >
          {ad.videoSpecificFileType ? (
            <source
              src={`${adsPath}/${ad.id}-1x.${ad.videoSpecificFileType}${queryStr}`}
              type={`video/${ad.videoSpecificFileType}`}
            />
          ) : (
            <>
              <source src={`${adsPath}/${ad.id}-1x.webm${queryStr}`} type="video/webm" />
              <source src={`${adsPath}/${ad.id}-1x.mp4${queryStr}`} type="video/mp4" />
            </>
          )}
        </video>
      )}
    </a>
  );
}
