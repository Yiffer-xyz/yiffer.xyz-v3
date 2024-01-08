import { RiArrowRightLine } from 'react-icons/ri';
import Link from '~/ui-components/Link';
import { useTheme } from '~/utils/theme-provider';
import SearchFilter from './SearchFilter';
import Paginator from './Paginator';
import { useCallback, useMemo } from 'react';
import ComicCard, { SkeletonComicCard } from './ComicCard';
import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { processApiError } from '~/utils/request-helpers';
import { useLoaderData, useSearchParams } from '@remix-run/react';
import { getComicsPaginated } from '~/route-funcs/get-comics-paginated';
import { browsePageSize } from '~/types/types';

type BrowseParams = {
  page: number;
  search?: string;
};

function parseBrowseParams(rawParams: URLSearchParams): BrowseParams {
  const page = parseInt(rawParams.get('page') ?? '1', 10);
  const search = rawParams.get('search') ?? undefined;

  return {
    page: isNaN(page) ? 1 : page,
    search,
  };
}

export async function loader(args: LoaderFunctionArgs) {
  const urlBase = args.context.DB_API_URL_BASE;

  const url = new URL(args.request.url);
  const params = parseBrowseParams(url.searchParams);

  const comicsRes = await getComicsPaginated({
    urlBase,
    limit: browsePageSize,
    offset: params.page !== 1 ? (params.page - 1) * browsePageSize : undefined,
    search: params.search,
  });
  if (comicsRes.err) {
    return processApiError('Error getting comics', comicsRes.err);
  }

  return {
    comics: comicsRes.result.comics,
    numberOfPages: comicsRes.result.numberOfPages,
  };
}

function useBrowseParams() {
  const [params, setParams] = useSearchParams();
  const parsedParams = useMemo(() => parseBrowseParams(params), [params]);

  const updateParams = useCallback(
    (paramName: string, newValue: string | number | undefined) => {
      if (newValue === undefined) {
        params.delete(paramName);
      } else {
        params.set(paramName, newValue.toString());
      }
      setParams(params);
    },
    [params, setParams]
  );

  const setPage = useCallback(
    (newPage: number) => updateParams('page', newPage),
    [updateParams]
  );

  const setSearch = useCallback(
    (newSearch: string) => updateParams('search', newSearch),
    [updateParams]
  );

  return {
    page: parsedParams.page,
    setPage,
    search: parsedParams.search,
    setSearch,
  };
}

export default function BrowsePage() {
  const [theme] = useTheme();
  const { page, setPage } = useBrowseParams();
  const { comics, numberOfPages } = useLoaderData<typeof loader>();

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

      <SearchFilter />

      <Paginator
        numPages={numberOfPages}
        currentPage={page}
        isLoading={false}
        onPageChange={onPageChange}
        className="mt-6"
      />

      <p className="text-sm mx-auto w-fit mt-2">1 322 comics</p>

      <div className="flex flex-row flex-wrap gap-4 items-center justify-center mt-4">
        {comics
          ? comics.map(comic => <ComicCard comic={comic} key={comic.id} />)
          : Array.from(Array(40).keys()).map(n => <SkeletonComicCard key={n} />)}
      </div>
    </div>
  );
}
const darkHeaderStyle = {
  backgroundImage:
    '-webkit-gradient(linear,left top,right top,color-stop(.2,#49ded7),color-stop(.8,#5df1ba))',
  backgroundClip: 'text',
};
const lightHeaderStyle = {
  color: '#0d0f35',
};
