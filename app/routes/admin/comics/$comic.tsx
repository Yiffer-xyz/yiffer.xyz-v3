import { LoaderArgs } from '@remix-run/cloudflare';
import { useLoaderData, useOutletContext, useRevalidator } from '@remix-run/react';
import { format } from 'date-fns';
import { MdOpenInNew } from 'react-icons/md';
import Link from '~/components/Link';
import { GlobalAdminContext } from '~/routes/admin';
import { getComicById } from '~/routes/api/funcs/get-comic';
import { Comic } from '~/types/types';
import { redirectIfNotMod } from '~/utils/loaders';
import { create500Json, logError } from '~/utils/request-helpers';
import AnonUploadSection from './AnonUploadedComicSection';
import LiveComic from './LiveComic';
import PendingComicSection from './PendingComicSection';
import UnlistedComicSection from './UnlistedComicSection';
import UserUploadSection from './UserUploadedComicSection';

export async function loader(args: LoaderArgs) {
  const user = await redirectIfNotMod(args);
  const urlBase = args.context.DB_API_URL_BASE as string;
  const comicParam = args.params.comic as string;

  const comicId = parseInt(comicParam);

  const { comic, err } = await getComicById(urlBase, comicId);
  if (err) {
    logError(`Error getting comic in admin>comic`, err);
    throw create500Json(err.clientMessage);
  }

  return { comic, user };
}

export default function ManageComicInner() {
  const revalidator = useRevalidator();
  const globalContext: GlobalAdminContext = useOutletContext();
  const { comic: maybeComic, user } = useLoaderData<typeof loader>();
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
      <h2 className="mb-2">{comic.name}</h2>

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
          <p className="mb-4">
            This comic is not live. It has been uploaded by a mod, or by a user and then
            passed mod review. Once all data is correct, an admin can schedule or publish
            the comic.
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
        <>
          <p className="text-lg text-theme1-darker">
            This comic is live!
            <Link
              href={`/${comic.name}`}
              className="ml-2"
              text="View live comic"
              IconRight={MdOpenInNew}
              newTab
            />
          </p>
          {comic.published && comic.updated && (
            <>
              <p>Published: {format(new Date(comic.published), 'PPP')}</p>
              <p>Last updated: {format(new Date(comic.updated), 'PPP')}</p>
            </>
          )}
        </>
      )}

      <LiveComic
        comic={comic}
        user={user}
        updateComic={updateComic}
        allComics={globalContext.comics}
        allArtists={globalContext.artists}
        allTags={globalContext.tags}
      />
    </>
  );
}
