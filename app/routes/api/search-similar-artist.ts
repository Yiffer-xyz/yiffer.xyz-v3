import { ActionFunction, json } from '@remix-run/cloudflare';
import { queryDb, queryDbDirect } from '~/utils/database-facade';
import stringDistance from '~/utils/string-distance';

export interface SimilarArtistResponse {
  similarArtists: string[];
  exactMatchArtist: string;
  similarBannedArtists: string[];
  exactMatchBannedArtist: string;
}

// This deals with handling logic only. The reusable parts go in a separate function.
export const action: ActionFunction = async function ({ request, context }) {
  const urlBase = context.URL_BASE_V2 as string;
  const body = await request.formData();
  const artistName = body.get('artistName') as string;

  const data = await getSimilarArtists(urlBase, artistName);
  return json(data);
};

export async function getSimilarArtists(
  urlBase: string,
  newArtistName: string
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

  let allArtistsQuery = 'SELECT Name AS name FROM artist';
  let bannedArtistsQuery = 'SELECT ArtistName AS name from bannedartist';
  let [allArtists, bannedArtists] = await Promise.all([
    queryDbDirect<{ name: string }[]>(urlBase, allArtistsQuery),
    queryDbDirect<{ name: string }[]>(urlBase, bannedArtistsQuery),
  ]);

  for (let artist of allArtists) {
    let distance = stringDistance(artist.name, newArtistName);
    if (distance === 0) {
      response.exactMatchArtist = artist.name;
    } else if (distance <= distanceThreshold) {
      response.similarArtists.push(artist.name);
    }
  }

  for (let bannedArtist of bannedArtists) {
    let distance = stringDistance(bannedArtist.name, newArtistName);
    if (distance === 0) {
      response.exactMatchBannedArtist = bannedArtist.name;
    } else if (distance <= distanceThreshold) {
      response.similarBannedArtists.push(bannedArtist.name);
    }
  }

  return response;
}
