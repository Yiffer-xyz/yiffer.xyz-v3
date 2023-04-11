import { ActionFunction } from '@remix-run/cloudflare';
import { queryDb } from '~/utils/database-facade';
import {
  ApiError,
  createSuccessJson,
  makeDbErrObj,
  processApiError,
} from '~/utils/request-helpers';
import stringDistance from '~/utils/string-distance';

export type SimilarArtistResponse = {
  similarArtists: string[];
  exactMatchArtist: string;
  similarBannedArtists: string[];
  exactMatchBannedArtist: string;
};

export const action: ActionFunction = async function ({ request, context }) {
  const urlBase = context.DB_API_URL_BASE as string;
  const body = await request.formData();
  const artistName = body.get('artistName') as string;
  const excludeName = body.get('excludeName');

  const { artists, err } = await getSimilarArtists(
    urlBase,
    artistName,
    excludeName ? excludeName.toString() : undefined
  );
  if (err) {
    return processApiError('Error in /search-similar-artist', err);
  }
  return createSuccessJson(artists);
};

export async function getSimilarArtists(
  urlBase: string,
  newArtistName: string,
  excludeName?: string
): Promise<{ err?: ApiError; artists?: SimilarArtistResponse }> {
  const logCtx = { newArtistName, excludeName };
  let similar: SimilarArtistResponse = {
    similarArtists: [],
    exactMatchArtist: '',
    similarBannedArtists: [],
    exactMatchBannedArtist: '',
  };
  if (newArtistName.length < 2) {
    return { artists: similar };
  }

  let distanceThreshold = 4;
  if (newArtistName.length < 14) {
    distanceThreshold = 3;
  }
  if (newArtistName.length < 5) {
    distanceThreshold = 2;
  }

  let allArtistsQuery = 'SELECT name, isBanned FROM artist';
  const allArtistsRes = await queryDb<{ name: string; isBanned: boolean }[]>(
    urlBase,
    allArtistsQuery
  );
  if (allArtistsRes.errorMessage) {
    return makeDbErrObj(allArtistsRes, 'Error getting all artists from db', logCtx);
  }

  for (let artist of allArtistsRes.result!) {
    if (artist.name === excludeName) continue;

    let distance = stringDistance(artist.name, newArtistName);
    if (distance === 0) {
      if (artist.isBanned) {
        similar.exactMatchBannedArtist = artist.name;
      } else {
        similar.exactMatchArtist = artist.name;
      }
    } else if (distance <= distanceThreshold) {
      if (artist.isBanned) {
        similar.similarBannedArtists.push(artist.name);
      } else {
        similar.similarArtists.push(artist.name);
      }
    }
  }

  return { artists: similar };
}
