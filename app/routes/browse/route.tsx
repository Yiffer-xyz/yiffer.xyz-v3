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
import { browsePageSize } from '~/types/types';
import { colors } from 'tailwind.config';
import {
  parseBrowseParams,
  sortToApiSort,
  useBrowseParams,
} from './SearchFilter/useBrowseParams';

export async function loader(args: LoaderFunctionArgs) {
  const url = new URL(args.request.url);
  const params = parseBrowseParams(url.searchParams);

  const categories = params.categories.includes('All') ? undefined : params.categories;

  const comicsRes = await getComicsPaginated({
    db: args.context.DB,
    limit: browsePageSize,
    offset: params.page !== 1 ? (params.page - 1) * browsePageSize : undefined,
    search: params.search,
    order: sortToApiSort(params.sort),
    tagIDs: params.tagIDs.length > 0 ? params.tagIDs : undefined,
    categories,
  });
  if (comicsRes.err) {
    return processApiError('Error getting comics, getComicsPaginated', comicsRes.err);
  }

  return {
    comics: comicsRes.result.comics,
    numberOfPages: comicsRes.result.numberOfPages,
    totalNumComics: comicsRes.result.totalNumComics,
  };
}

export default function BrowsePage() {
  const { theme } = useUIPreferences();
  const browseUtilities = useBrowseParams();
  const { comics, numberOfPages, totalNumComics } = useLoaderData<typeof loader>();
  const { page, setPage } = browseUtilities;

  function onPageChange(newPage: number) {
    setPage(newPage);
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

      <a
        href="https://nrk.no"
        target="_blank"
        rel="noreferrer"
        className="block w-fit mx-auto mt-4"
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          height={90}
          width={300}
          className="rounded"
          style={{ height: 90, width: 300 }}
        >
          <source src="https://static-beta.yiffer.xyz/pi/IEIWXK.webm" type="video/webm" />
          <source src="https://static-beta.yiffer.xyz/pi/IEIWXK.mp4" type="video/mp4" />
        </video>
      </a>

      <div className="flex flex-col gap-1 justify-center items-center mt-4">
        <Link
          href="/contribute"
          text="Contribute: upload or suggest comics"
          IconRight={RiArrowRightLine}
        />
        <Link
          href="/advertising-info"
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

      <div className="flex flex-row flex-wrap gap-4 items-stretch justify-center mt-4">
        {comics
          ? comics.map(comic => <ComicCard comic={comic} key={comic.id} />)
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
