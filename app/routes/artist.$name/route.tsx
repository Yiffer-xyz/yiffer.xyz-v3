import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { getArtistByField } from '~/route-funcs/get-artist';
import { getComicsByArtistField } from '~/route-funcs/get-comics';
import type { Artist, ComicTiny } from '~/types/types';
import { processApiError } from '~/utils/request-helpers';

export async function loader(args: LoaderFunctionArgs): Promise<{
  artist?: Artist;
  comics: ComicTiny[];
  notFound?: boolean;
  queriedArtistName: string;
}> {
  const artistName = args.params.name;
  if (!artistName) return { notFound: true, comics: [], queriedArtistName: '' };

  const artistRes = await getArtistByField(
    args.context.DB_API_URL_BASE,
    'name',
    artistName
  );
  const comicsRes = await getComicsByArtistField(
    args.context.DB_API_URL_BASE,
    'name',
    artistName
  );

  if (artistRes.err) return processApiError('Error getting artist', artistRes.err);
  if (comicsRes.err) return processApiError('Error getting comics', comicsRes.err);

  if (artistRes.notFound)
    return { notFound: true, comics: [], queriedArtistName: artistName };

  return {
    artist: artistRes.result,
    comics: comicsRes.result,
    notFound: false,
    queriedArtistName: artistName,
  };
}

export default function ArtistPage() {
  const { artist, comics, notFound, queriedArtistName } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>Artist: {artist?.name ?? queriedArtistName}</h1>

      {!notFound && (
        <>
          <pre>
            <code>{JSON.stringify(artist, null, 2)}</code>
          </pre>

          <h2>
            Comics: These should def be more complete than the ComicTiny type,
            <br /> so we can show a proper ComicCard.
            <br /> I just quickly reused an existing function. Expand or replace it, TODO!
          </h2>
          <pre>
            <code>{JSON.stringify(comics, null, 2)}</code>
          </pre>
        </>
      )}

      {notFound && <p>No artist exists with name "{queriedArtistName}".</p>}
    </div>
  );
}
