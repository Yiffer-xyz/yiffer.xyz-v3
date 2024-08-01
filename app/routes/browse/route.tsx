import { RiArrowRightLine } from 'react-icons/ri';
import Link from '~/ui-components/Link';
import { useUIPreferences } from '~/utils/theme-provider';
import SearchFilter from './SearchFilter/SearchFilterContainer';
import Paginator from './Paginator';
import ComicCard, { SkeletonComicCard } from './ComicCard';
import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { processApiError } from '~/utils/request-helpers';
import { useLoaderData } from '@remix-run/react';
import { getComicsPaginated } from '~/route-funcs/get-comics-paginated';
import { colors } from 'tailwind.config';
import {
  parseBrowseParams,
  sortToApiSort,
  useBrowseParams,
} from './SearchFilter/useBrowseParams';
import { getUIPrefSession } from '~/utils/theme.server';
import { authLoader } from '~/utils/loaders';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import { COMICS_PER_PAGE } from '~/types/constants';
import { isComic } from '~/utils/general';
import AdComicCard from './AdComicCard';
import { getAdForViewing } from '~/route-funcs/get-ads-for-viewing';
import Ad from '~/ui-components/Ad/Ad';

export async function loader(args: LoaderFunctionArgs) {
  const url = new URL(args.request.url);
  const params = parseBrowseParams(url.searchParams);
  const uiPrefSession = await getUIPrefSession(args.request);
  const user = await authLoader(args);

  const categories = params.categories.includes('All') ? undefined : params.categories;

  const comicsResPromise = getComicsPaginated({
    db: args.context.DB,
    limit: COMICS_PER_PAGE,
    offset: params.page !== 1 ? (params.page - 1) * COMICS_PER_PAGE : undefined,
    search: params.search,
    order: sortToApiSort(params.sort),
    tagIDs: params.tagIDs.length > 0 ? params.tagIDs : undefined,
    categories,
    includeTags: uiPrefSession.getUiPref().comicCardTags,
    userId: user?.userId,
    includeAds: true,
  });
  const adPromise = getAdForViewing({ db: args.context.DB, adType: 'topSmall' });

  const [comicsRes, adRes] = await Promise.all([comicsResPromise, adPromise]);

  if (comicsRes.err) {
    return processApiError('Error getting comics, getComicsPaginated', comicsRes.err);
  }
  if (adRes.err) {
    return processApiError('Error getting ad, getAdForViewing', adRes.err);
  }

  return {
    comicsAndAds: comicsRes.result.comicsAndAds,
    numberOfPages: comicsRes.result.numberOfPages,
    totalNumComics: comicsRes.result.totalNumComics,
    topAd: adRes.result,
    pagesPath: args.context.PAGES_PATH,
    adsPath: args.context.ADS_PATH,
  };
}

export default function BrowsePage() {
  const { theme } = useUIPreferences();
  const browseUtilities = useBrowseParams();
  const { comicsAndAds, numberOfPages, totalNumComics, pagesPath, adsPath, topAd } =
    useLoaderData<typeof loader>();
  const { page, setPage } = browseUtilities;

  function onPageChange(newPage: number) {
    setPage(newPage);
  }

  const toggleBookmarkFetcher = useGoodFetcher({
    method: 'post',
    url: '/api/toggle-bookmark',
  });
  function toggleBookmark(comicId: number) {
    toggleBookmarkFetcher.submit({ comicId });
  }

  return (
    <div>
      <h1
        className="text-center mt-6 dark:text-transparent dark:bg-clip-text w-fit mx-auto text-4xl md:text-6xl"
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

      <SearchFilter browseUtilities={browseUtilities} />

      <Paginator
        numPages={numberOfPages}
        currentPage={page}
        isLoading={false}
        onPageChange={onPageChange}
        className="mt-6"
      />

      <p className="text-sm mx-auto w-fit mt-2">
        {totalNumComics.toLocaleString('en').replace(',', ' ')} comics
      </p>

      <div className="flex flex-row flex-wrap gap-4 items-stretch justify-center mt-4 px-2 md:px-4 max-w-[1780px] mx-auto pb-20">
        {comicsAndAds
          ? comicsAndAds.map(comicOrAd =>
              isComic(comicOrAd) ? (
                <ComicCard
                  comic={comicOrAd}
                  key={comicOrAd.id}
                  pagesPath={pagesPath}
                  toggleBookmark={toggleBookmark}
                />
              ) : (
                <AdComicCard ad={comicOrAd} adsPath={adsPath} key={comicOrAd.renderId} />
              )
            )
          : Array.from(Array(40).keys()).map(n => <SkeletonComicCard key={n} />)}
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
