import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { getArtistAndComicsByField } from '~/route-funcs/get-artist';
import type { Artist, ComicForBrowse } from '~/types/types';
import { processApiError } from '~/utils/request-helpers';
import ArtistLinks from './ArtistLinks';
import { authLoader } from '~/utils/loaders';
import ComicCard from '../browse/ComicCard';
import Breadcrumbs from '~/ui-components/Breadcrumbs/Breadcrumbs';
import ArtistEditor from '~/page-components/ComicManager/ArtistEditor';
import Link from '~/ui-components/Link';

export default function ArtistPage() {
  const { artist, comics, notFound, queriedArtistName, pagesPath, isMod } =
    useLoaderData<typeof loader>();

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

        {isMod && (
          <Link
            href={`/admin/artists/${artist?.id}`}
            text="Edit artist in mod panel"
            className="mt-4"
            showRightArrow
          />
        )}

        {!notFound && artist && <ArtistLinks artist={artist} pagesPath={pagesPath} />}
      </div>

      {!notFound && artist && (
        <>
          <div className="mt-6 w-fit">
            {comics.length > 0 ? (
              <div className="flex flex-row flex-wrap justify-center gap-4">
                {comics.map(comic => (
                  <ComicCard
                    key={comic.id}
                    comic={comic}
                    showStaticTags
                    pagesPath={pagesPath}
                  />
                ))}
              </div>
            ) : (
              <p>No comics found.</p>
            )}
          </div>
        </>
      )}

      {notFound && <p className="mt-6">Artist not found.</p>}
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
};

export async function loader(args: LoaderFunctionArgs): Promise<LoaderData> {
  const user = await authLoader(args);
  const artistName = args.params.name;

  const returnVal: LoaderData = {
    notFound: false,
    comics: [],
    queriedArtistName: artistName ?? '',
    pagesPath: args.context.PAGES_PATH,
    isMod: user?.userType === 'admin' || user?.userType === 'moderator',
  };

  if (!artistName) {
    returnVal.notFound = true;
    return returnVal;
  }

  const combinedRes = await getArtistAndComicsByField(
    args.context.DB,
    'name',
    artistName,
    user?.userId
  );

  if (combinedRes.err) {
    return processApiError('Error getting artist+comics', combinedRes.err);
  }
  if (combinedRes.notFound) {
    returnVal.notFound = true;
    return returnVal;
  }

  returnVal.artist = combinedRes.result.artist;
  returnVal.comics = combinedRes.result.comics;
  return returnVal;
}
