import { unstable_defineLoader } from '@remix-run/cloudflare';
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
import ComicReportProblem from './ComicReportProblem';
import { getAdForViewing } from '~/route-funcs/get-ads-for-viewing';
import Ad from '~/ui-components/Advertising/Ad';
import type { AdForViewing, Comic } from '~/types/types';
import DisplayOptionsAndPages from './DisplayOptionsAndPages';
import Button from '~/ui-components/Buttons/Button';
import { MdArrowUpward } from 'react-icons/md';
import { useState } from 'react';
import Breadcrumbs from '~/ui-components/Breadcrumbs/Breadcrumbs';
export { YifferErrorBoundary as ErrorBoundary } from '~/utils/error';

export const desktopStatsWidth = 144;

export default function ComicPage() {
  const { comic, queriedComicName, notFound, pagesPath, isLoggedIn, ad, adsPath, isMod } =
    useLoaderData<typeof loader>();

  const [isManagingTags, setIsManagingTags] = useState(false);
  const [isReportingProblem, setIsReportingProblem] = useState(false);

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

  const comicNotFound = notFound || !comic || comic.name === null;

  return (
    <div className="p-4 md:p-5 pt-2 container mx-auto block md:flex md:flex-col md:items-center">
      <div className="md:w-[728px]">
        <h1 className="text-3xl md:text-4xl break-all">
          {comic?.name ?? queriedComicName}
        </h1>
        {!comicNotFound && (
          <p className="mt-1 md:text-lg">
            by{' '}
            <Link
              href={`/artist/${comic.artist.name}`}
              text={comic.artist.name}
              isInsideParagraph
            />
          </p>
        )}

        <Breadcrumbs
          currentRoute={comic?.name ?? queriedComicName}
          prevRoutes={[{ text: 'Browse', href: '/browse' }]}
          className="!mb-1"
        />

        {isMod && (
          <div className="mt-2.5 mb-1">
            <Link
              href={`/admin/comics/${comic?.id}`}
              text="Edit comic in mod panel"
              showRightArrow
            />
          </div>
        )}
      </div>

      {!comicNotFound && (
        <>
          <div className="md:w-[728px]">
            <div className="flex flex-row justify-between relative">
              <div className="flex flex-col">
                <ComicRateBookmark
                  comic={comic}
                  updateStars={updateStars}
                  toggleBookmark={toggleBookmark}
                  isLoggedIn={isLoggedIn}
                  className="flex"
                />

                <div className="flex flex-row flex-wrap gap-1.5 mt-4 md:pr-[144px]">
                  {comic.tags.map(tag => (
                    <TagElement tag={tag} key={tag.id} disableHoverEffects />
                  ))}
                </div>
              </div>

              <ComicStats comic={comic} />
            </div>

            {!isManagingTags && !isReportingProblem && (
              <div className="mt-6 w-full">
                <DropdownButton
                  text="Contribute"
                  style={{ width: 154 }}
                  options={[
                    {
                      text: 'Add or remove tags',
                      onClick: () => setIsManagingTags(true),
                    },
                    {
                      text: 'Report problem',
                      onClick: () => setIsReportingProblem(true),
                    },
                  ]}
                />
              </div>
            )}
          </div>

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

          <DisplayOptionsAndPages comic={comic} pagesPath={pagesPath}>
            {ad && <Ad ad={ad} className="mt-4" adsPath={adsPath} />}
          </DisplayOptionsAndPages>

          <Button
            text="To top"
            className="mt-6 mx-auto"
            startIcon={MdArrowUpward}
            onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })}
          />
        </>
      )}

      {comicNotFound && <p className="mt-6">Comic not found.</p>}
    </div>
  );
}

type LoaderData = {
  comic: Comic | null;
  ad: AdForViewing | null;
  notFound: boolean;
  isLoggedIn: boolean;
  pagesPath: string;
  adsPath: string;
  queriedComicName: string;
  isMod: boolean;
};

export const loader = unstable_defineLoader(async args => {
  const user = await authLoader(args);
  const comicName = args.params.comicname as string;

  const res: LoaderData = {
    comic: null,
    ad: null,
    notFound: false,
    isLoggedIn: !!user,
    pagesPath: args.context.cloudflare.env.PAGES_PATH,
    adsPath: args.context.cloudflare.env.ADS_PATH,
    queriedComicName: comicName,
    isMod: user?.userType === 'admin' || user?.userType === 'moderator',
  };

  const adPromise = getAdForViewing({
    adType: 'banner',
    db: args.context.cloudflare.env.DB,
  });

  const comicPromise = getComicByField({
    db: args.context.cloudflare.env.DB,
    fieldName: 'name',
    fieldValue: comicName,
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
});
