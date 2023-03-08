import { LoaderArgs } from '@remix-run/cloudflare';
import {
  useLoaderData,
  useOutletContext,
  useParams,
  useRevalidator,
} from '@remix-run/react';
import { GlobalAdminContext } from '~/routes/admin';
import { getComicById } from '~/routes/api/funcs/get-comic';
import AnonUploadSection from './AnonUploadedComicSection';
import PendingComicSection from './PendingComicSection';

export async function loader(args: LoaderArgs) {
  const urlBase = args.context.DB_API_URL_BASE as string;
  const comicParam = args.params.comic as string;

  const comicId = parseInt(comicParam);

  const comic = await getComicById(urlBase, comicId);
  return comic;
}

export default function ManageComicInner() {
  const revalidator = useRevalidator();
  const globalContext: GlobalAdminContext = useOutletContext();
  const comicData = useLoaderData<typeof loader>();

  const isAnonUpload =
    comicData.publishStatus === 'uploaded' && !comicData.unpublishedData?.uploadUserId;
  const isUserUpload =
    comicData.publishStatus === 'uploaded' && comicData.unpublishedData?.uploadUserId;

  return (
    <>
      <h2 className="mb-2">{comicData.name}</h2>

      {comicData.publishStatus === 'rejected' && (
        <p>REJECTED!!!!! TODO FIGURE THIS OUT</p>
      )}

      {isAnonUpload && (
        <div className="bg-theme1-primaryTrans p-4 pt-3 w-fit">
          <h3>User-uploaded comic, anonymous</h3>
          <AnonUploadSection
            comicData={comicData}
            updateComic={() => revalidator.revalidate()}
          />
        </div>
      )}

      {comicData.publishStatus === 'pending' && (
        <div className="bg-theme1-primaryTrans p-4 pt-3 w-fit">
          <h3>Pending comic</h3>
          <p className="mb-4">
            This comic is not live. It has been uploaded by a mod, or by a user and then
            passed mod review. Once all data is correct, an admin can schedule or publish
            the comic.
          </p>

          <PendingComicSection
            comicData={comicData}
            updateComic={() => revalidator.revalidate()}
          />
        </div>
      )}
      <pre className="mt-32">{JSON.stringify(comicData, null, 2)}</pre>
    </>
  );
}
