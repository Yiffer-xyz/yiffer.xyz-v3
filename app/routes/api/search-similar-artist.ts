import { ActionFunction, json } from '@remix-run/cloudflare';
import { queryDbDirect } from '~/utils/database-facade';
import stringDistance from '~/utils/string-distance';

export type SimilarArtistResponse = {
  similarArtists: string[];
  exactMatchArtist: string;
  similarBannedArtists: string[];
  exactMatchBannedArtist: string;
};

// This deals with handling logic only. The reusable parts go in a separate function.
export const action: ActionFunction = async function ({ request, context }) {
  const urlBase = context.DB_API_URL_BASE as string;
  const body = await request.formData();
  const artistName = body.get('artistName') as string;
  const excludeName = body.get('excludeName');

  const data = await getSimilarArtists(
    urlBase,
    artistName,
    excludeName ? excludeName.toString() : undefined
  );

  return json(data);
};

export async function getSimilarArtists(
  urlBase: string,
  newArtistName: string,
  excludeName?: string
): Promise<SimilarArtistResponse> {
  let response: SimilarArtistResponse = {
    similarArtists: [],
    exactMatchArtist: '',
    similarBannedArtists: [],
    exactMatchBannedArtist: '',
  };
  if (newArtistName.length < 2) {
    return response;
  }

  let distanceThreshold = 4;
  if (newArtistName.length < 14) {
    distanceThreshold = 3;
  }
  if (newArtistName.length < 5) {
    distanceThreshold = 2;
  }

  let allArtistsQuery = 'SELECT name, isBanned FROM artist';
  const allArtists = await queryDbDirect<{ name: string; isBanned: boolean }[]>(
    urlBase,
    allArtistsQuery
  );

  for (let artist of allArtists) {
    if (artist.name === excludeName) continue;

    let distance = stringDistance(artist.name, newArtistName);
    if (distance === 0) {
      if (artist.isBanned) {
        response.exactMatchBannedArtist = artist.name;
      } else {
        response.exactMatchArtist = artist.name;
      }
    } else if (distance <= distanceThreshold) {
      if (artist.isBanned) {
        response.similarBannedArtists.push(artist.name);
      } else {
        response.similarArtists.push(artist.name);
      }
    }
  }

  return response;
}
