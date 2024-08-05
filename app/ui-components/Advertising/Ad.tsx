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
  className?: HTMLAttributes<HTMLAnchorElement>['className'];
};

export default function Ad({
  ad,
  adsPath,
  excludeClickLogging,
  bypassCache,
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

  const { width, height } = fullAd.minDimensions;
  const queryStr = bypassCache ? `?q=${randomString(3)}` : '';

  return (
    <a
      href={ad.link}
      target="_blank"
      rel="noreferrer"
      className={className}
      onClick={onClick}
    >
      <picture style={{ width, height }}>
        <source
          srcSet={`${adsPath}/${ad.id}-2x.webp${queryStr}`}
          type="image/webp"
          width={width}
          height={height}
        />
        <img
          src={`${adsPath}/${ad.id}-2x.jpg${queryStr}`}
          alt="illustration"
          width={width}
          height={height}
        />
      </picture>
    </a>
  );
}
