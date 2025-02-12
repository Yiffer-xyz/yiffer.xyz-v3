import { useLoaderData } from '@remix-run/react';
import { getComicByField } from '~/route-funcs/get-comic';
import { processApiError } from '~/utils/request-helpers';
import ComicRateBookmark from './ComicRateBookmark';
import { authLoader } from '~/utils/loaders';
import TagElement from '~/ui-components/TagElement/TagElement';
import Link from '~/ui-components/Link';
import ComicStats from './ComicStats';
import ComicManageTags from './ComicManageTags';
import DropdownButton from '~/ui-components/Buttons/DropdownButton';
import ComicReportProblem from './ComicReportProblem';
import { getAdForViewing } from '~/route-funcs/get-ads-for-viewing';
import Ad from '~/ui-components/Advertising/Ad';
import { isModOrAdmin, type AdForViewing, type Comic } from '~/types/types';
import DisplayOptionsAndPages from './DisplayOptionsAndPages';
import Button from '~/ui-components/Buttons/Button';
import { MdArrowUpward } from 'react-icons/md';
import { useMemo, useState } from 'react';
import Breadcrumbs from '~/ui-components/Breadcrumbs/Breadcrumbs';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { getSimilarlyNamedComics } from '../api.search-similarly-named-comic';
import { RiShieldFill } from 'react-icons/ri';
import updateUserLastActionTime from '~/route-funcs/update-user-last-action';
import { shouldShowAdsForUser } from '~/utils/user-utils';
export { YifferErrorBoundary as ErrorBoundary } from '~/utils/error';

export const desktopStatsWidth = 144;

export const meta: MetaFunction = ({ data }) => {
  const comicName = (data as LoaderData)?.comic?.name;
  if (!comicName) return [{ title: `Not found | Yiffer.xyz` }];
  return [{ title: `${comicName} | Yiffer.xyz` }];
};

export default function ComicPage() {
  const {
    comic,
    queriedComicName,
    notFound,
    pagesPath,
    isLoggedIn,
    ad,
    adsPath,
    isMod,
    notFoundSimilarComicNames,
  } = useLoaderData<LoaderData>();

  const [showMobileTags, setShowMobileTags] = useState(false);
  const [isManagingTags, setIsManagingTags] = useState(false);
  const [isReportingProblem, setIsReportingProblem] = useState(false);

  const comicNotFound = notFound || !comic || comic.name === null;
  const hasLinks = !!comic?.previousComic || !!comic?.nextComic;

  const infoBoxesExtraMarginClass = useMemo(() => {
    if (hasLinks || !comic) return 'md:mt-6';
    if (comic.tags.length > 12) return 'md:mt-12';
    if (comic.tags.length > 0) return 'md:mt-14';
    return 'md:mt-[78px]';
  }, [comic, hasLinks]);

  const isPublished = comic?.publishStatus === 'published';

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

        {isMod && !notFound && isPublished && (
          <div className="mt-2.5 mb-1 flex-row items-center">
            <RiShieldFill className="text-blue-weak-200 dark:text-blue-strong-300 mr-1 mb-1" />
            <Link
              href={`/admin/comics/${comic?.id}`}
              text="Edit comic in mod panel"
              showRightArrow
            />
          </div>
        )}

        {comicNotFound && (
          <div className="mt-6">
            <p>Comic not found.</p>
            {notFoundSimilarComicNames.length > 0 && (
              <>
                <p className="mt-4">Comics with similar names:</p>
                {notFoundSimilarComicNames.map(comicName => (
                  <p key={comicName} className="mt-1">
                    <Link href={`/c/${comicName}`} text={comicName} showRightArrow />
                  </p>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {!comicNotFound && (
        <>
          {isPublished && (
            <div className="md:w-[728px]">
              <div className="flex flex-row justify-between relative">
                <div className="flex flex-col">
                  <ComicRateBookmark
                    comic={comic}
                    isLoggedIn={isLoggedIn}
                    source="comic-page"
                    className="flex"
                  />

                  <ComicSeriesLinks comic={comic} className="mt-2" />

                  {/* Desktop: tags always visible */}
                  {comic.tags.length > 0 && (
                    <div className="flex-row flex-wrap gap-1.5 mt-4 md:pr-[144px] hidden md:flex">
                      {comic.tags.map(tag => (
                        <TagElement tag={tag} key={tag.id} disableHoverEffects />
                      ))}
                    </div>
                  )}

                  {/* Mobile: Button, tags hidden by default */}
                  {comic.tags.length > 0 && (
                    <div className="flex-row flex-wrap gap-1.5 mt-4 md:pr-[144px] flex md:hidden">
                      {!showMobileTags && (
                        <Button
                          text="Show tags"
                          variant="naked"
                          onClick={() => setShowMobileTags(true)}
                          className="-ml-3 -mt-4"
                        />
                      )}
                      {showMobileTags &&
                        comic.tags.map(tag => (
                          <TagElement tag={tag} key={tag.id} disableHoverEffects />
                        ))}
                    </div>
                  )}
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
          )}

          {!isPublished && (
            <div className="bg-theme1-primaryTrans p-4 pt-3 w-full md:w-[728px] mt-2 -mb-4">
              <h4>Comic preview</h4>
              <p className="text-sm">
                This comic is not live, and is inaccessible to non-mod users.
              </p>
              <Link
                href={`/admin/comics/${comic?.id}`}
                text="Edit comic in mod panel"
                showRightArrow
              />
            </div>
          )}

          {isManagingTags && (
            <ComicManageTags
              comic={comic}
              setIsManagingTags={setIsManagingTags}
              isLoggedIn={isLoggedIn}
              isMod={isMod}
              infoBoxesExtraMarginClass={infoBoxesExtraMarginClass}
            />
          )}

          {isReportingProblem && (
            <ComicReportProblem
              comic={comic}
              setIsReportingProblem={setIsReportingProblem}
              isLoggedIn={isLoggedIn}
              infoBoxesExtraMarginClass={infoBoxesExtraMarginClass}
            />
          )}

          <DisplayOptionsAndPages comic={comic} pagesPath={pagesPath}>
            {ad && <Ad ad={ad} className="mt-4" adsPath={adsPath} />}
          </DisplayOptionsAndPages>

          <ComicSeriesLinks comic={comic} className="mt-6 -mb-4" />

          <Button
            text="To top"
            className="mt-6 mx-auto"
            startIcon={MdArrowUpward}
            onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })}
          />
        </>
      )}
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
  notFoundSimilarComicNames: string[];
};

export async function loader(args: LoaderFunctionArgs) {
  const user = await authLoader(args);
  const comicName = args.params.comicname as string;

  if (user) {
    updateUserLastActionTime({ db: args.context.cloudflare.env.DB, userId: user.userId });
  }

  const res: LoaderData = {
    comic: null,
    ad: null,
    notFound: false,
    isLoggedIn: !!user,
    pagesPath: args.context.cloudflare.env.PAGES_PATH,
    adsPath: args.context.cloudflare.env.ADS_PATH,
    queriedComicName: comicName,
    isMod: user?.userType === 'admin' || user?.userType === 'moderator',
    notFoundSimilarComicNames: [],
  };

  const adPromise = shouldShowAdsForUser(user)
    ? getAdForViewing({
        adType: 'banner',
        db: args.context.cloudflare.env.DB,
      })
    : Promise.resolve({ err: undefined, result: null });

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

    const similarComicsRes = await getSimilarlyNamedComics(
      args.context.cloudflare.env.DB,
      comicName
    );
    if (similarComicsRes.err) {
      return processApiError(
        'Error getting similar comics in /comic',
        similarComicsRes.err
      );
    }
    if (similarComicsRes.result.similarComics.length > 0) {
      res.notFoundSimilarComicNames = similarComicsRes.result.similarComics;
    }

    return Response.json(res, { status: 404 });
  }

  if (comicRes.result.publishStatus !== 'published' && (!user || !isModOrAdmin(user))) {
    return Response.json(res, { status: 404 });
  }

  res.comic = comicRes.result;
  res.ad = adRes.result;
  return res;
}

function ComicSeriesLinks({ comic, className }: { comic?: Comic; className?: string }) {
  if (!comic?.previousComic && !comic?.nextComic) return null;

  return (
    <div className={className}>
      <p>This comic is part of a series:</p>
      {comic.previousComic && (
        <p>
          Prev:{' '}
          <Link
            href={`/c/${comic.previousComic.name}`}
            text={comic.previousComic.name}
            isInsideParagraph
          />
        </p>
      )}
      {comic.nextComic && (
        <p>
          Next:{' '}
          <Link
            href={`/c/${comic.nextComic.name}`}
            text={comic.nextComic.name}
            isInsideParagraph
          />
        </p>
      )}
    </div>
  );
}
