import { RiArrowRightLine } from 'react-icons/ri';
import Link from '~/ui-components/Link';
import { useUIPreferences } from '~/utils/theme-provider';
import SearchFilter from './SearchFilter/SearchFilterContainer';
import Paginator from './Paginator';
import ComicCard, { SkeletonComicCard } from './ComicCard';
import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { makeDbErr, processApiError } from '~/utils/request-helpers';
import { useLoaderData } from '@remix-run/react';
import type { ComicsPaginatedResult } from '~/route-funcs/get-comics-paginated';
import { addAdsToComics, getComicsPaginated } from '~/route-funcs/get-comics-paginated';
import { colors } from 'tailwind.config';
import type { BrowseParams } from './SearchFilter/useBrowseParams';
import {
  parseBrowseParams,
  sortToApiSort,
  useBrowseParams,
} from './SearchFilter/useBrowseParams';
import { getUIPrefSession } from '~/utils/theme.server';
import { authLoader } from '~/utils/loaders';
import { ADS_PER_PAGE, COMICS_PER_PAGE } from '~/types/constants';
import { isComic } from '~/utils/general';
import AdComicCard from '../../ui-components/Advertising/AdComicCard';
import { getAdForViewing, getCardAdForViewing } from '~/route-funcs/get-ads-for-viewing';
import Ad from '~/ui-components/Advertising/Ad';
import pluralize from 'pluralize';
import { getHasOldComicRatings } from '~/route-funcs/get-old-comic-ratings';
import OldComicRatingsInfo from './OldComicRatings';
import type { AdForViewing, ComicForBrowse, UserSession } from '~/types/types';
import { queryDb } from '~/utils/database-facade';
import { getAndCacheComicsPaginated } from '~/route-funcs/get-and-cache-comicspaginated';
import updateUserLastActionTime from '~/route-funcs/update-user-last-action';
import { shouldShowAdsForUser } from '~/utils/user-utils';
export { YifferErrorBoundary as ErrorBoundary } from '~/utils/error';

function isBasicPage1Query(params: BrowseParams) {
  return (
    params.page === 1 &&
    params.sort === 'Updated' &&
    params.tagIDs.length === 0 &&
    params.bookmarkedOnly === false &&
    params.categories.includes('All') &&
    params.search === '' &&
    params.tagIDs.length === 0
  );
}

async function getComics(
  args: LoaderFunctionArgs,
  params: BrowseParams,
  includeTags: boolean,
  user: UserSession | null,
  includeAds = true
): Promise<ComicsPaginatedResult> {
  const canUseCached = isBasicPage1Query(params) && !user;
  const db = args.context.cloudflare.env.DB;

  if (user) {
    updateUserLastActionTime({ db, userId: user.userId });
  }

  if (canUseCached) {
    const query = `SELECT comicsJson FROM comicspaginatedcache WHERE page = ?`;
    const cachedRes = await queryDb<{ comicsJson: string }[]>(
      db,
      query,
      [params.page],
      'Comics paginated cache'
    );

    if (cachedRes.isError) {
      return processApiError(
        'Error getting comics paginated from cache',
        makeDbErr(cachedRes, 'Error getting comics paginated from cache')
      );
    }

    if (cachedRes.result.length > 0) {
      const parsed = JSON.parse(cachedRes.result[0].comicsJson) as ComicsPaginatedResult;
      let comicsAndMaybeAds = parsed.comicsAndAds as (ComicForBrowse | AdForViewing)[];

      if (includeAds) {
        const cardAdsRes = await getCardAdForViewing({
          db,
          numberOfAds: ADS_PER_PAGE,
        });

        if (cardAdsRes.err) {
          return processApiError('Error getting card ads', cardAdsRes.err);
        }

        const cardAds = cardAdsRes.result;
        comicsAndMaybeAds = addAdsToComics(
          parsed.comicsAndAds as ComicForBrowse[],
          cardAds
        );
      }

      return {
        ...parsed,
        comicsAndAds: comicsAndMaybeAds,
      };
    }
  }

  // We get here either if the cache returned empty (basically, never), or if the user is logged in.
  let comicPaginatedResult: ComicsPaginatedResult;

  if (canUseCached) {
    // The rare case, should only happen literally once ever. User is not logged in.
    const comicsAndAdsRes = await getAndCacheComicsPaginated({
      db,
      pageNum: params.page,
      includeAds,
    });
    if (comicsAndAdsRes.err) {
      return processApiError('Error in getComics, /browse', comicsAndAdsRes.err, {
        canUseCached,
      });
    }
    comicPaginatedResult = comicsAndAdsRes.result;
  } else {
    // No caching for logged in users, for now.
    const categories = params.categories.includes('All') ? undefined : params.categories;
    const comicsAndAdsRes = await getComicsPaginated({
      db,
      limit: COMICS_PER_PAGE,
      offset: params.page !== 1 ? (params.page - 1) * COMICS_PER_PAGE : undefined,
      search: params.search,
      order: sortToApiSort(params.sort),
      tagIDs: params.tagIDs.length > 0 ? params.tagIDs : undefined,
      categories,
      includeTags,
      userId: user?.userId,
      bookmarkedOnly: params.bookmarkedOnly,
      includeAds,
    });

    if (comicsAndAdsRes.err) {
      return processApiError('Error in getComics, /browse', comicsAndAdsRes.err, {
        canUseCached,
      });
    }
    comicPaginatedResult = comicsAndAdsRes.result;
  }

  return comicPaginatedResult;
}

export async function loader(args: LoaderFunctionArgs) {
  const url = new URL(args.request.url);
  const params = parseBrowseParams(url.searchParams);
  const uiPrefSession = await getUIPrefSession(args.request);
  const user = await authLoader(args);

  const comicsResPromise = getComics(
    args,
    params,
    uiPrefSession.getUiPref().comicCardTags,
    user,
    shouldShowAdsForUser(user)
  );

  const adPromise = shouldShowAdsForUser(user)
    ? getAdForViewing({
        db: args.context.cloudflare.env.DB,
        adType: 'topSmall',
      })
    : Promise.resolve({ err: undefined, result: null });
  const oldComicRatingsPromise = getHasOldComicRatings(
    args.context.cloudflare.env.DB,
    user?.userId
  );

  const [comicsRes, adRes, oldComicRatingsRes] = await Promise.all([
    comicsResPromise,
    adPromise,
    oldComicRatingsPromise,
  ]);

  if (adRes.err) {
    return processApiError('Error getting ad, getAdForViewing', adRes.err);
  }
  if (oldComicRatingsRes.err) {
    return processApiError(
      'Error getting old comic ratings, getOldComicRatings',
      oldComicRatingsRes.err
    );
  }

  return {
    comicsAndAds: comicsRes.comicsAndAds,
    numberOfPages: comicsRes.numberOfPages,
    totalNumComics: comicsRes.totalNumComics,
    topAd: adRes.result,
    pagesPath: args.context.cloudflare.env.PAGES_PATH,
    adsPath: args.context.cloudflare.env.ADS_PATH,
    isLoggedIn: !!user,
    hasOldComicRatings: !!oldComicRatingsRes.result,
  };
}

export default function BrowsePage() {
  const { theme } = useUIPreferences();
  const browseUtilities = useBrowseParams();
  const {
    comicsAndAds,
    numberOfPages,
    totalNumComics,
    pagesPath,
    adsPath,
    topAd,
    isLoggedIn,
    hasOldComicRatings,
  } = useLoaderData<typeof loader>();
  const { page, setPage } = browseUtilities;

  function onPageChange(newPage: number, { scrollTop }: { scrollTop: boolean }) {
    setPage(newPage, { scrollTop });
  }

  const isNoComics = totalNumComics === 0;

  return (
    <div>
      <h1
        className="text-center mt-6 dark:text-transparent dark:bg-clip-text w-fit mx-auto text-[57px] md:text-[72px]"
        style={{
          fontFamily: 'Shrikhand,cursive',
          ...(theme === 'dark' ? darkHeaderStyle : lightHeaderStyle),
        }}
      >
        Yiffer.xyz
      </h1>

      {topAd && <Ad ad={topAd} adsPath={adsPath} className="mx-auto mt-4 w-fit block" />}

      <div className="flex flex-col gap-1 justify-center items-center mt-4">
        <Link
          href="/contribute"
          text="Contribute: upload or suggest comics"
          IconRight={RiArrowRightLine}
        />
        <Link
          href="/advertising"
          text="Advertise your furry stuff on Yiffer.xyz"
          IconRight={RiArrowRightLine}
        />
      </div>

      {hasOldComicRatings && <OldComicRatingsInfo />}

      <SearchFilter browseUtilities={browseUtilities} isLoggedIn={isLoggedIn} />

      {!isNoComics && (
        <Paginator
          numPages={numberOfPages}
          currentPage={page}
          onPageChange={page => onPageChange(page, { scrollTop: false })}
          className="mt-6"
        />
      )}

      <p className={`text-sm mx-auto w-fit mt-${isNoComics ? '8' : '2'}`}>
        {totalNumComics.toLocaleString('en').replace(',', ' ')}{' '}
        {pluralize('comic', totalNumComics)}
      </p>

      <div className="pb-6">
        <div
          className="flex flex-row flex-wrap gap-4 items-stretch justify-center mt-4 
          px-1 md:px-4 max-w-[1780px] mx-auto mb-8"
        >
          {comicsAndAds
            ? comicsAndAds.map(comicOrAd =>
                isComic(comicOrAd) ? (
                  <ComicCard
                    comic={comicOrAd}
                    key={comicOrAd.id}
                    pagesPath={pagesPath}
                    isLoggedIn={isLoggedIn}
                  />
                ) : (
                  <AdComicCard
                    ad={comicOrAd}
                    adsPath={adsPath}
                    key={comicOrAd.renderId}
                  />
                )
              )
            : Array.from(Array(40).keys()).map(n => <SkeletonComicCard key={n} />)}
        </div>

        {!isNoComics && comicsAndAds.length > 5 && (
          <Paginator
            numPages={numberOfPages}
            currentPage={page}
            onPageChange={page => onPageChange(page, { scrollTop: true })}
          />
        )}
      </div>
    </div>
  );
}
const darkHeaderStyle = {
  backgroundImage: `-webkit-gradient(linear,left top,right top,color-stop(.2,${colors.theme1.dark}),color-stop(.8,${colors.theme2.dark}))`,
  backgroundClip: 'text',
};
const lightHeaderStyle = {
  color: '#0d0f35',
};
