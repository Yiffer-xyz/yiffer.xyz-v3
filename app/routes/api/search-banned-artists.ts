import type { ActionFunction } from '@remix-run/cloudflare';
import type { Artist } from '~/types/types';
import { json } from '@remix-run/cloudflare';

type SimilarBannedArtistList = {
  similarArtists: Array<Artist>;
  exactMatchArtist: string | null;
};

export const action: ActionFunction = async function ({ request, context }) {
  const urlBase = context.URL_BASE as string;
  const body = await request.formData();
  const artistName = body.get('artistName') as string;

  if (!artistName) return json([]);

  const similarBannedArtists = await getSimilarBannedArtists(urlBase, artistName);

  if (similarBannedArtists.exactMatchArtist) {
    return json({ bannedArtists: [similarBannedArtists.exactMatchArtist] });
  } else if (similarBannedArtists.similarArtists.length > 0) {
    return json({ bannedArtists: similarBannedArtists.similarArtists });
  }

  return json({ bannedArtists: [] });
};

async function getSimilarBannedArtists(
  urlBase: string,
  artistName: string
): Promise<SimilarBannedArtistList> {
  const response = await fetch(`${urlBase}/api/similar-banned-artists?artistName=${artistName}`);
  const similarArtists: SimilarBannedArtistList = await response.json();

  return similarArtists;
}
