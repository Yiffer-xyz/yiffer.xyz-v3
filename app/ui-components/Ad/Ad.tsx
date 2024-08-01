import { useMemo, type HTMLAttributes } from 'react';
import { useDevicePixelRatio } from 'use-device-pixel-ratio';
import { ADVERTISEMENTS } from '~/types/constants';
import type { AdForViewing } from '~/types/types';
import { useGoodFetcher } from '~/utils/useGoodFetcher';

type Props = {
  ad: AdForViewing;
  adsPath: string;
  className?: HTMLAttributes<HTMLAnchorElement>['className'];
};

export default function Ad({ ad, adsPath, className }: Props) {
  const fullAd = ADVERTISEMENTS.find(fullAd => fullAd.name === ad.adType);
  const devicePixelRatio = useDevicePixelRatio({ defaultDpr: 2 });
  const multiplier = useMemo(() => (devicePixelRatio > 2 ? 3 : 2), [devicePixelRatio]);

  const logClickFetcher = useGoodFetcher({
    url: '/api/log-click',
    method: 'post',
  });

  if (!fullAd) return null;

  function onClick() {
    logClickFetcher.submit({ adId: ad.id });
  }

  const { width, height } = fullAd.minDimensions;

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
          srcSet={`${adsPath}/${ad.id}-${multiplier}x.webp`}
          type="image/webp"
          width={width}
          height={height}
        />
        <img
          src={`${adsPath}/${ad.id}-${multiplier}x.jpg`}
          alt="Advertisement"
          width={width}
          height={height}
        />
      </picture>
    </a>
  );
}
