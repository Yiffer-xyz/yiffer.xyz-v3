import { ActionFunction, json } from '@remix-run/cloudflare';

export interface SimilarArtistResponse {
  similarArtists: string[];
  exactMatchArtist: string;
  similarBannedArtists: string[];
  exactMatchBannedArtist: string;
}

// This deals with handling logic only. The reusable parts go in a separate function.
export const action: ActionFunction = async function ({ request, context }) {
  const urlBase = context.URL_BASE;
  const body = await request.formData();
  const artistName = body.get('artistName') as string;

  const data = await getSimilarArtists(urlBase, artistName);
  return json(data);
};

// This can be exported later to be used via other api routes in this project if needed.
// In the full remix version, this will contain the logic for querying the database.
async function getSimilarArtists(
  urlBase: string,
  artistName: string
): Promise<SimilarArtistResponse> {
  const oldApiResponse = await fetch(`${urlBase}/api/similar-artists?artistName=${artistName}`);
  const similarArtists = await oldApiResponse.json();
  return similarArtists as SimilarArtistResponse;
}
