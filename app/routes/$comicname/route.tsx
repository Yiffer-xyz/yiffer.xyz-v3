import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { getComicByField } from '~/route-funcs/get-comic';
import { processApiError } from '~/utils/request-helpers';
import ComicRateBookmark from './ComicRateBookmark';
import { authLoader } from '~/utils/loaders';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import TagElement from '~/ui-components/TagElement/TagElement';
import Link from '~/ui-components/Link';
import ComicStats from './ComicStats';
import ComicManageTags from './ComicManageTags';
import DropdownButton from '~/ui-components/Buttons/DropdownButton';
import { useEffect, useState } from 'react';
import { padPageNumber } from '~/utils/general';
import ComicReportProblem from './ComicReportProblem';
import { getAdForViewing } from '~/route-funcs/get-ads-for-viewing';
import Ad from '~/ui-components/Advertising/Ad';
import type { PageDisplay, AdForViewing, Comic } from '~/types/types';
import ComicDisplayOptions from './ComicDisplayOptions';
import { useUIPreferences } from '~/utils/theme-provider';
import { displayToPageStyle } from '~/utils/comic-utils';
import Button from '~/ui-components/Buttons/Button';
import { MdArrowUpward } from 'react-icons/md';

type LoaderData = {
  comic: Comic | null;
  ad: AdForViewing | null;
  notFound: boolean;
  isLoggedIn: boolean;
  pagesPath: string;
  adsPath: string;
};

export async function loader(args: LoaderFunctionArgs) {
  const user = await authLoader(args);

  const res: LoaderData = {
    comic: null,
    ad: null,
    notFound: false,
    isLoggedIn: !!user,
    pagesPath: args.context.PAGES_PATH,
    adsPath: args.context.ADS_PATH,
  };

  const adPromise = getAdForViewing({ adType: 'banner', db: args.context.DB });

  const comicPromise = getComicByField({
    db: args.context.DB,
    fieldName: 'name',
    fieldValue: args.params.comicname as string,
    userId: user?.userId,
  });

  const [adRes, comicRes] = await Promise.all([adPromise, comicPromise]);

  if (comicRes.err) {
    return processApiError('Error getting comic in /comic', comicRes.err);
  }
  if (adRes.err) {
    return processApiError('Error getting ad in /comic', adRes.err);
  }
  if (comicRes.notFound) {
    res.notFound = true;
    return res;
  }

  res.comic = comicRes.result;
  res.ad = adRes.result;
  return res;
}

export default function ComicPage() {
  const { comic, notFound, pagesPath, isLoggedIn, ad, adsPath } =
    useLoaderData<typeof loader>();

  const { comicPageReverseOrder: reverseOrderCache, comicPageDisplay } =
    useUIPreferences();

  const [isManagingTags, setIsManagingTags] = useState(false);
  const [isReportingProblem, setIsReportingProblem] = useState(false);
  const [isReverseOrderLocal, setIsReverseOrderLocal] = useState<boolean | null>(null);
  const [displayLocal, setDisplayLocal] = useState<PageDisplay | null>(null);

  const isReverseOrder = isReverseOrderLocal ?? reverseOrderCache;
  const display = displayLocal ?? comicPageDisplay;

  const updateYourStarsFetcher = useGoodFetcher({
    method: 'post',
    url: '/api/update-your-stars',
  });

  const toggleBookmarkFetcher = useGoodFetcher({
    method: 'post',
    url: '/api/toggle-bookmark',
  });

  function updateStars(stars: number) {
    updateYourStarsFetcher.submit({
      stars,
      comicId: comic!.id,
    });
  }

  function toggleBookmark() {
    toggleBookmarkFetcher.submit({
      comicId: comic!.id,
    });
  }

  const [style, setStyle] = useState(displayToPageStyle(comicPageDisplay, true));

  // There are slight differences between SSR and how we want it to look on the client.
  // Namely, on the client we sometimes want specific pixel values for the width and height,
  // so that the images don't jump around if the screen size changes. We can't get these values
  // on the server, however, so there and on first client load, use percentages, which should
  // always match until the window size potentially changes. Then, on the second render, update
  // the style to use the pixel values.
  useEffect(() => {
    setStyle(displayToPageStyle(display, false));
  }, [display]);

  if (notFound || !comic) {
    return <div>Comic not found</div>;
  }

  return (
    <div className="p-4 md:p-5 pt-2 container mx-auto block md:flex md:flex-col md:items-center">
      <div>
        <h1 className="text-3xl md:text-4xl">{comic.name}</h1>
        <p className="mt-1 md:text-center md:text-lg">
          by{' '}
          <Link
            href={`/artist/${comic.artist.name}`}
            text={comic.artist.name}
            isInsideParagraph
          />
        </p>
      </div>

      <div className="flex flex-row md:flex-col justify-between md:w-[728px]">
        <div className="flex flex-col md:items-center">
          <ComicRateBookmark
            comic={comic}
            updateStars={updateStars}
            toggleBookmark={toggleBookmark}
            isLoggedIn={isLoggedIn}
          />

          <div className="flex flex-row flex-wrap gap-1.5 mt-4">
            {comic.tags.map(tag => (
              <TagElement tag={tag} key={tag.id} disableHoverEffects />
            ))}
          </div>
        </div>

        <ComicStats comic={comic} />
      </div>

      {!isManagingTags && !isReportingProblem && (
        <div className="md:w-[728px] mt-4 md:mt-5">
          <DropdownButton
            text="Contribute"
            style={{ width: 140 }}
            options={[
              { text: 'Add or remove tags', onClick: () => setIsManagingTags(true) },
              { text: 'Report problem', onClick: () => setIsReportingProblem(true) },
            ]}
          />
        </div>
      )}

      {isManagingTags && (
        <ComicManageTags
          comic={comic}
          setIsManagingTags={setIsManagingTags}
          isLoggedIn={isLoggedIn}
        />
      )}

      {isReportingProblem && (
        <ComicReportProblem
          comic={comic}
          setIsReportingProblem={setIsReportingProblem}
          isLoggedIn={isLoggedIn}
        />
      )}

      <ComicDisplayOptions
        isReverseOrder={isReverseOrder}
        setIsReverseOrder={setIsReverseOrderLocal}
        display={display}
        setDisplay={setDisplayLocal}
      />

      {ad && <Ad ad={ad} className="mt-4" adsPath={adsPath} />}

      <div className="gap-4 mt-4 flex flex-col items-center w-full">
        {Array.from({ length: comic.numberOfPages }, (_, i) => (
          <img
            key={i}
            src={`${pagesPath}/${comic.name}/${padPageNumber(isReverseOrder ? comic.numberOfPages - i : i + 1)}.jpg`}
            alt={`Page ${i + 1}`}
            className="comicPage"
            style={style}
          />
        ))}
      </div>

      <Button
        text="To top"
        className="mt-6 mx-auto"
        startIcon={MdArrowUpward}
        onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })}
      />
    </div>
  );
}
