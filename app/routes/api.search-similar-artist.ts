import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { queryDb } from '~/utils/database-facade';
import type { noGetRoute, ResultOrErrorPromise } from '~/utils/request-helpers';
import {
  createSuccessJson,
  makeDbErrObj,
  processApiError,
} from '~/utils/request-helpers';
import { stringDistance } from '~/utils/string-utils';

export { noGetRoute as loader };

export type SimilarArtistResponse = {
  similarArtists: string[];
  exactMatchArtist: string;
  similarBannedArtists: string[];
  exactMatchBannedArtist: string;
};

export async function action(args: ActionFunctionArgs) {
  const body = await args.request.formData();
  const artistName = body.get('artistName') as string;
  const excludeName = body.get('excludeName');

  const artistsRes = await getSimilarArtists(
    args.context.cloudflare.env.DB,
    artistName,
    excludeName ? excludeName.toString() : undefined
  );
  if (artistsRes.err) {
    return processApiError('Error in /search-similar-artist', artistsRes.err);
  }
  return createSuccessJson(artistsRes.result);
}

export async function getSimilarArtists(
  db: D1Database,
  newArtistName: string,
  excludeName?: string
): ResultOrErrorPromise<SimilarArtistResponse> {
  const logCtx = { newArtistName, excludeName };
  const similar: SimilarArtistResponse = {
    similarArtists: [],
    exactMatchArtist: '',
    similarBannedArtists: [],
    exactMatchBannedArtist: '',
  };
  if (newArtistName.length < 2) {
    return { result: similar };
  }

  let distanceThreshold = 4;
  if (newArtistName.length < 14) {
    distanceThreshold = 3;
  }
  if (newArtistName.length < 5) {
    distanceThreshold = 2;
  }

  const allArtistsQuery = 'SELECT name, isBanned FROM artist';
  const allArtistsRes = await queryDb<{ name: string; isBanned: boolean }[]>(
    db,
    allArtistsQuery,
    null,
    'Artists, all, for similarity search'
  );
  if (allArtistsRes.isError || !allArtistsRes.result) {
    return makeDbErrObj(allArtistsRes, 'Error getting all artists from db', logCtx);
  }

  for (const artist of allArtistsRes.result) {
    if (artist.name === excludeName) continue;

    const distance = stringDistance(artist.name, newArtistName);
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

  return { result: similar };
}
