import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { getArtistAndComicsByField } from '~/route-funcs/get-artist';
import type { Artist, ComicForBrowse } from '~/types/types';
import { processApiError } from '~/utils/request-helpers';
import ArtistLinks from './ArtistLinks';
import { authLoader } from '~/utils/loaders';
import ComicCard from '../browse/ComicCard';

export async function loader(args: LoaderFunctionArgs): Promise<{
  artist?: Artist;
  comics: ComicForBrowse[];
  notFound?: boolean;
  queriedArtistName: string;
  pagesPath: string;
}> {
  const user = await authLoader(args);
  const artistName = args.params.name;
  if (!artistName)
    return {
      notFound: true,
      comics: [],
      queriedArtistName: '',
      pagesPath: args.context.PAGES_PATH,
    };

  const combinedRes = await getArtistAndComicsByField(
    args.context.DB,
    'name',
    artistName,
    user?.userId
  );

  console.log(combinedRes);

  if (combinedRes.err) {
    return processApiError('Error getting artist+comics', combinedRes.err);
  }
  if (combinedRes.notFound) {
    return {
      notFound: true,
      comics: [],
      queriedArtistName: artistName,
      pagesPath: args.context.PAGES_PATH,
    };
  }

  return {
    artist: combinedRes.result.artist,
    comics: combinedRes.result.comics,
    notFound: false,
    queriedArtistName: artistName,
    pagesPath: args.context.PAGES_PATH,
  };
}

export default function ArtistPage() {
  const { artist, comics, notFound, queriedArtistName, pagesPath } =
    useLoaderData<typeof loader>();

  return (
    <div className="p-4 md:p-5 pt-2 container mx-auto block md:flex md:flex-col md:items-center">
      <h1 className="text-3xl md:text-4xl">
        Artist: {artist?.name ?? queriedArtistName}
      </h1>

      {!notFound && artist && (
        <>
          <ArtistLinks artist={artist} />

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

      {notFound && <p className="mt-6">There is no artist with this name.</p>}
    </div>
  );
}
