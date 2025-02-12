import { useLoaderData, useOutletContext, useRevalidator } from '@remix-run/react';
import { format } from 'date-fns';
import Link from '~/ui-components/Link';
import type { GlobalAdminContext } from '~/routes/admin/route';
import { getComicByField } from '~/route-funcs/get-comic';
import type { Comic } from '~/types/types';
import { redirectIfNotMod } from '~/utils/loaders';
import { processApiError } from '~/utils/request-helpers';
import AnonUploadSection from './AnonUploadedComicSection';
import LiveComic from './LiveComic';
import PendingComicSection from './PendingComicSection';
import UnlistedComicSection from './UnlistedComicSection';
import UserUploadSection from './UserUploadedComicSection';
import { FaRegStar } from 'react-icons/fa';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { MdArrowBack } from 'react-icons/md';
export { AdminErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const comicName = data?.comic?.name;
  return [{ title: `Mod: ${comicName} (comic) | Yiffer.xyz` }];
};

export default function ManageComicInner() {
  const revalidator = useRevalidator();
  const globalContext: GlobalAdminContext = useOutletContext();
  const {
    comic: maybeComic,
    user,
    PAGES_PATH,
    IMAGES_SERVER_URL,
  } = useLoaderData<typeof loader>();
  if (!maybeComic) {
    return <div>Comic not found</div>;
  }
  const comic = maybeComic as Comic;

  const isAnonUpload =
    comic.publishStatus === 'uploaded' && !comic.metadata?.uploadUserId;
  const isUserUpload = comic.publishStatus === 'uploaded' && comic.metadata?.uploadUserId;
  const isPendingOrScheduled =
    comic.publishStatus === 'pending' || comic.publishStatus === 'scheduled';
  const isRejected =
    comic.publishStatus === 'rejected' || comic.publishStatus === 'rejected-list';

  function updateComic() {
    revalidator.revalidate();
  }

  return (
    <>
      <h2 className="mt-1">{comic.name}</h2>
      <div className="mb-2">
        <Link href="/admin/comics" text="Back" Icon={MdArrowBack} />
      </div>

      {isRejected && (
        <div className="bg-theme1-primaryTrans p-4 pt-3 w-fit">
          <h3>Rejected comic</h3>
          <p className="mb-2">This comic has been rejected.</p>
          {comic.publishStatus === 'rejected' && (
            <p>It has not been added to the ban list.</p>
          )}
          {comic.publishStatus === 'rejected-list' && (
            <>
              <p>
                It has been added to the ban list, so users will be warned when trying to
                suggest or upload comics with this name.
              </p>
              {comic.metadata?.modComment && (
                <p>Mod comment: {comic.metadata.modComment}</p>
              )}
            </>
          )}
        </div>
      )}

      {isAnonUpload && (
        <div className="bg-theme1-primaryTrans p-4 pt-3 w-fit">
          <h3>User-uploaded comic, anonymous</h3>
          <AnonUploadSection comicData={comic} updateComic={updateComic} />
        </div>
      )}

      {isUserUpload && (
        <div className="bg-theme1-primaryTrans p-4 pt-3 w-fit">
          <h3>User-uploaded comic</h3>
          <UserUploadSection comicData={comic} updateComic={updateComic} />
        </div>
      )}

      {isPendingOrScheduled && (
        <div className="bg-theme1-primaryTrans p-4 pt-3 w-fit">
          <h3>Pending comic</h3>
          <p className="text-sm">
            This comic is not live. It has been uploaded by a mod, or by a user and then
            passed mod review. Once all data is correct, the comic should be added to the
            publishing queue.
          </p>
          <p className="mb-4 mt-2">
            <Link
              href={`/c/${comic.name}`}
              text="Preview comic page"
              showRightArrow
              isInsideParagraph
            />
          </p>

          <PendingComicSection comicData={comic} updateComic={updateComic} />
        </div>
      )}

      {comic.publishStatus === 'unlisted' && (
        <div className="bg-theme1-primaryTrans p-4 pt-3 w-fit">
          <h3>Unlisted comic</h3>
          <UnlistedComicSection comicData={comic} updateComic={updateComic} user={user} />
        </div>
      )}

      {comic.publishStatus === 'published' && (
        <div className="bg-theme1-primaryTrans p-4 pt-3 w-fit">
          <p className="text-theme1-darker font-bold">
            This comic is live!
            <Link
              href={`/c/${comic.name}`}
              className="ml-2"
              text="View comic"
              isInsideParagraph
              showRightArrow
            />
          </p>
          {comic.published && comic.updated && (
            <>
              <p>Published: {format(comic.published, 'PPP')}</p>
              <p>Last updated: {format(comic.updated, 'PPP')}</p>
              <p>
                <FaRegStar size={16} className="mb-[5px]" /> {comic.sumStars} ·{' '}
                {comic.avgStarsPercent}% · {comic.numTimesStarred} ratings
              </p>
            </>
          )}
        </div>
      )}

      <LiveComic
        comic={comic}
        user={user}
        allComics={globalContext.comics}
        allArtists={globalContext.artists}
        allTags={globalContext.tags}
        blockActions={globalContext.numUnreadContent > 0}
        PAGES_PATH={PAGES_PATH}
        IMAGES_SERVER_URL={IMAGES_SERVER_URL}
      />
    </>
  );
}

export async function loader(args: LoaderFunctionArgs) {
  const user = await redirectIfNotMod(args);
  const comicParam = args.params.comic as string;

  const PAGES_PATH = args.context.cloudflare.env.PAGES_PATH;
  const IMAGES_SERVER_URL = args.context.cloudflare.env.IMAGES_SERVER_URL;

  const comicId = parseInt(comicParam);
  if (isNaN(comicId)) {
    return { comic: null, user, PAGES_PATH, IMAGES_SERVER_URL };
  }

  const comicsRes = await getComicByField({
    db: args.context.cloudflare.env.DB,
    fieldName: 'id',
    fieldValue: comicId,
    includeMetadata: true,
  });
  if (comicsRes.err) {
    return processApiError('Error getting comic in admin>comic', comicsRes.err);
  }
  if (comicsRes.notFound) {
    return { comic: null, user, PAGES_PATH, IMAGES_SERVER_URL };
  }

  return {
    comic: comicsRes.result,
    user,
    PAGES_PATH,
    IMAGES_SERVER_URL,
  };
}
