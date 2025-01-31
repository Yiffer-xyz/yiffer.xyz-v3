import { useLoaderData } from '@remix-run/react';
import { getArtistAndComicsByField } from '~/route-funcs/get-artist';
import type { Artist, ComicForBrowse } from '~/types/types';
import { processApiError } from '~/utils/request-helpers';
import ArtistLinks from './ArtistLinks';
import { authLoader } from '~/utils/loaders';
import ComicCard from '../browse/ComicCard';
import Breadcrumbs from '~/ui-components/Breadcrumbs/Breadcrumbs';
import Link from '~/ui-components/Link';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { RiShieldFill } from 'react-icons/ri';
export { YifferErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction = ({ data }) => {
  const comicName = (data as LoaderData)?.artist?.name;
  if (!comicName) return [{ title: `Not found | Yiffer.xyz` }];
  return [{ title: `${comicName} (Artist) | Yiffer.xyz` }];
};

export default function ArtistPage() {
  const { artist, comics, notFound, queriedArtistName, pagesPath, isMod, isLoggedIn } =
    useLoaderData<LoaderData>();

  const comicsGridClassName = comics.length > 4 ? 'lg:justify-center' : 'md:w-[728px]';

  return (
    <div className="p-4 md:p-5 pt-2 container mx-auto block md:flex md:flex-col md:items-center">
      <div className="md:w-[728px]">
        <h1 className="text-3xl md:text-4xl">
          Artist: {artist?.name ?? queriedArtistName}
        </h1>

        <Breadcrumbs
          currentRoute={artist?.name ?? queriedArtistName}
          prevRoutes={[{ text: 'Browse', href: '/browse' }]}
        />

        {isMod && !notFound && (
          <div className="mt-2.5 mb-1 flex-row items-center">
            <RiShieldFill className="text-blue-weak-200 dark:text-blue-strong-300 mr-1 mb-1" />
            <Link
              href={`/admin/artists/${artist?.id}`}
              text="Edit artist in mod panel"
              className="mt-4"
              showRightArrow
            />
          </div>
        )}

        {!notFound && artist && <ArtistLinks artist={artist} pagesPath={pagesPath} />}
        {notFound && <p className="mt-6">Artist not found.</p>}
      </div>

      {!notFound && artist && (
        <>
          <div className="mt-6 md:mt-2 md:container block md:mx-auto md:flex md:flex-col md:items-center">
            {comics.length > 0 ? (
              <div
                className={`flex flex-row flex-wrap justify-start w-full ${comicsGridClassName} gap-4`}
              >
                {comics.map(comic => (
                  <ComicCard
                    key={comic.id}
                    comic={comic}
                    showStaticTags
                    pagesPath={pagesPath}
                    isLoggedIn={isLoggedIn}
                  />
                ))}
              </div>
            ) : (
              <p>No comics found.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

type LoaderData = {
  artist?: Artist;
  comics: ComicForBrowse[];
  notFound?: boolean;
  queriedArtistName: string;
  pagesPath: string;
  isMod: boolean;
  isLoggedIn: boolean;
};

export async function loader(args: LoaderFunctionArgs) {
  const user = await authLoader(args);
  const artistName = args.params.name;

  const returnVal: LoaderData = {
    notFound: false,
    comics: [],
    queriedArtistName: artistName ?? '',
    pagesPath: args.context.cloudflare.env.PAGES_PATH,
    isMod: user?.userType === 'admin' || user?.userType === 'moderator',
    isLoggedIn: !!user,
  };

  if (!artistName) {
    returnVal.notFound = true;
    return returnVal;
  }

  const combinedRes = await getArtistAndComicsByField(
    args.context.cloudflare.env.DB,
    'name',
    artistName,
    user?.userId
  );

  if (combinedRes.err) {
    return processApiError('Error getting artist+comics', combinedRes.err);
  }
  if (combinedRes.notFound) {
    returnVal.notFound = true;
    return Response.json(returnVal, { status: 404 });
  }

  returnVal.artist = combinedRes.result.artist;
  returnVal.comics = combinedRes.result.comics;
  return returnVal;
}
