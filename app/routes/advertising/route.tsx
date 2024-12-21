import { useState } from 'react';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import {
  ADVERTISEMENTS,
  CARD_AD_MAIN_TEXT_MAX_LENGTH,
  CARD_AD_SECONDARY_TEXT_MAX_LENGTH,
} from '~/types/constants';
import type { AdvertisementInfo } from '~/types/types';
import Breadcrumbs from '~/ui-components/Breadcrumbs/Breadcrumbs';
import LinkCard from '~/ui-components/LinkCard/LinkCard';
import SelectBoxes from '~/ui-components/SelectBoxes/SelectBoxes';
import comicCardImage from '~/assets/ad-examples/comiccard-example.png';
import comicCardImageDark from '~/assets/ad-examples/comiccard-example-dark.png';
import topSmallImage from '~/assets/ad-examples/topsmall-example.png';
import topSmallImageDark from '~/assets/ad-examples/topsmall-example-dark.png';
import bannerImage from '~/assets/ad-examples/banner-example.png';
import bannerImageDark from '~/assets/ad-examples/banner-example-dark.png';
import { useUIPreferences } from '~/utils/theme-provider';
import AdPaymentInstructions from '../advertising_.dashboard_.$adId/AdPaymentInstructions';
export { YifferErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction = () => {
  return [{ title: `Advertising | Yiffer.xyz` }];
};

export async function loader(args: LoaderFunctionArgs) {
  return {};
}

export default function Advertising() {
  const [selectedAd, setSelectedAd] = useState<AdvertisementInfo | null>(null);
  const { theme } = useUIPreferences();

  return (
    <div className="container mx-auto pb-16">
      <h1>Advertising</h1>

      <Breadcrumbs
        prevRoutes={[{ text: 'Me', href: '/me' }]}
        currentRoute="Advertising"
      />

      <div className="flex flex-row flex-wrap gap-4 mt-4">
        <LinkCard
          href="/advertising/dashboard"
          title="Advertising dashboard"
          includeRightArrow
        />

        <LinkCard
          href="/advertising/apply"
          title="Apply for advertisement"
          includeRightArrow
        />
      </div>

      <div className="mt-6 flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-6">
        <div className="p-4 rounded-lg bg-white dark:bg-gray-300 flex flex-col gap-1 h-fit shadow-lg md:shadow-xl">
          <h2 className="text-lg font-bold text-theme2-darker2 dark:text-theme2-dark">
            Advertsing for furry+adjacent creators
          </h2>
          <p>
            No matter your type of creativity or service, as long as it is furry or
            furry-related, you can advertise it here! Artists, writers, fursuit makers,
            convention organizers, photographers, Onlyfans models - all are welcome.
            Suggestive and censored ads are allowed - more details below.
          </p>
        </div>
        <div className="p-4 rounded-lg bg-white dark:bg-gray-300 flex flex-col gap-1 h-fit shadow-lg md:shadow-xl">
          <h2 className="text-lg font-bold text-theme2-darker2 dark:text-theme2-dark">
            40,000+ daily visitors
          </h2>
          <p>
            As of January 2022, about 40,000 people are visiting Yiffer.xyz every day. We
            record the number of clicks your ads get and display this in a neat little
            dashboard, so you can see and decide for yourself whether to keep going after
            your first months.
          </p>
        </div>
        <div className="p-4 rounded-lg bg-white dark:bg-gray-300 flex flex-col gap-1 h-fit shadow-lg md:shadow-xl">
          <h2 className="text-lg font-bold text-theme2-darker2 dark:text-theme2-dark">
            Not blocked by adblockers
          </h2>
          <p>
            Because we've crafted this advertising service ourselves, your ads will not be
            hidden by adblockers.
          </p>
        </div>
        <div className="p-4 rounded-lg bg-white dark:bg-gray-300 flex flex-col gap-1 h-fit shadow-lg md:shadow-xl">
          <h2 className="text-lg font-bold text-theme2-darker2 dark:text-theme2-dark">
            FREE trial for creators!
          </h2>
          <p>
            We're offering your first month free if you're a <i>content creator</i>. This
            includes creatives, Onlyfans models, and so on.
          </p>
        </div>
      </div>

      <h2 className="mt-6">Ad types</h2>
      <p>Click an ad type for more information.</p>
      <SelectBoxes
        options={ADVERTISEMENTS.map(ad => ({
          text: ad.title,
          value: ad,
          description: ad.description,
          children: <p>${ad.pricesForMonths[1]} per month</p>,
        }))}
        onChange={ad => setSelectedAd(ad)}
        value={selectedAd}
        equalWidth
      />

      {selectedAd && (
        <div className="mt-4">
          <h4>{selectedAd.title}</h4>

          <div className="flex flex-col md:grid md:grid-cols-[1fr_auto] gap-4">
            <div>
              {selectedAd.name === 'card' && (
                <p>
                  Your ad will appear at random in the same style as comics in the main
                  page. Many ads are loaded per page of comics, giving your ad a higher
                  chance of showing up per page load compared to the other ad types.
                </p>
              )}
              {selectedAd.name === 'banner' && (
                <p>
                  Your ad will be displayed above comics, a very eye-catching spot. The
                  dimensions are the same as those of Furaffinity, so you can reuse ads
                  from there.
                </p>
              )}
              {selectedAd.name === 'topSmall' && (
                <p>
                  Your ad will be displayed at the top of the main browse page. The
                  dimensions are the same as those of Furaffinity, so you can reuse ads
                  from there.
                </p>
              )}

              <p className="font-semibold mt-3">Prices</p>
              <p>
                1 month: <b>${selectedAd.pricesForMonths[1]}</b>
              </p>
              <p>
                4 months: <b>${selectedAd.pricesForMonths[4] / 4} per month</b> ($
                {selectedAd.pricesForMonths[4]} total)
              </p>
              <p>
                12 months: <b>${selectedAd.pricesForMonths[12] / 12} per month</b> ($
                {selectedAd.pricesForMonths[12]} total)
              </p>

              <p className="font-semibold mt-3">Requirements</p>
              {selectedAd.name === 'card' && (
                <>
                  <p>
                    Main text required, up to {CARD_AD_MAIN_TEXT_MAX_LENGTH} characters.
                  </p>
                  <p>
                    Secondary text optional, up to {CARD_AD_SECONDARY_TEXT_MAX_LENGTH}{' '}
                    characters.
                  </p>
                </>
              )}
              {selectedAd.alternativeDimensions ? (
                <>
                  <p>
                    Recommended dimensions:{' '}
                    <u>
                      {selectedAd.idealDimensions?.width} x{' '}
                      {selectedAd.idealDimensions?.height}
                    </u>
                    .
                  </p>
                  {selectedAd.alternativeDimensions
                    .sort((a, b) => b.width - a.width)
                    .map(dim => (
                      <p key={dim.width}>
                        Alternative:{' '}
                        <u>
                          {dim.width} x {dim.height}
                        </u>
                      </p>
                    ))}
                  <p>
                    Uploading in lower than recommended resolution will lead to your ad
                    appearing in lower quality than it otherwise could.
                  </p>
                </>
              ) : (
                <p>
                  Dimensions:{' '}
                  <u>
                    {selectedAd.minDimensions.width} x {selectedAd.minDimensions.height}{' '}
                    only.
                  </u>
                </p>
              )}
              <p>
                Images can be cropped and resized in the browser, videos/gifs must be
                uploaded in this exact resolution.
              </p>
            </div>
            <div>
              {selectedAd.name === 'card' && (
                <img
                  src={theme === 'light' ? comicCardImage : comicCardImageDark}
                  alt="Comic card ad example"
                  width={180}
                />
              )}
              {selectedAd.name === 'topSmall' && (
                <img
                  src={theme === 'light' ? topSmallImage : topSmallImageDark}
                  alt="Top small ad example"
                  width={260}
                />
              )}
              {selectedAd.name === 'banner' && (
                <img
                  src={theme === 'light' ? bannerImage : bannerImageDark}
                  alt="Banner ad example"
                  width={260}
                />
              )}
            </div>
          </div>
        </div>
      )}

      <h2 className="mt-6">Additional information</h2>
      <div className="flex flex-col gap-4">
        <AdPaymentInstructions className="mt-1" />
        <p>
          The ads may be suggestive, but no excessive lewdness. Genitals are not strictly
          forbidden, but keep it tasteful. Media including content that is commonly
          frowned upon will be rejected. Censored pictures are allowed. If you're
          uncertain, feel free to ask us at advertising@yiffer.xyz in advance.
        </p>
        <p>
          The frequency of your ads showing up entirely depends on how many advertisers
          there are in total. If there are ten advertisers, every tenth ad (give or take)
          will be your own. This goes for all types of ads.
        </p>
        <p>
          Each price is for a single ad with a single image/gif/video. It is perfectly
          fine to apply several times with different media. You may also upload the same
          image/gif/video if you want your ad to show up more frequently. These will be
          treated as separate ads and you will have to pay for each one. If you've paid
          for two ads and there are ten in total, about two out of every ten ads displayed
          will be yours.
        </p>
        <p>
          Our prices may change in the future. If you have paid for an X-month commitment,
          you will not be affected by these changes for the duration of your commitment.
        </p>
        <p>Gifs/videos must not have rapidly flashing lights or colors.</p>
        <p>
          For the free trial, we reserve the right to not offer it if the content being
          advertised seems to be of questionable quality.
        </p>
        <p>
          We will happily answer any questions you may have regarding advertising via
          email at advertising@yiffer.xyz. If you have suggestions for improvements of our
          advertising service, feel free to let us know!
        </p>
      </div>
    </div>
  );
}
