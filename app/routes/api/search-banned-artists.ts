import type { ActionFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { queryDbDirect } from '~/utils/database-facade';
import stringDistance from '~/utils/string-distance';

type SimilarBannedArtistList = {
  similarArtists: string[];
  exactMatchArtist: string | null;
};

export const action: ActionFunction = async function ({ request, context }) {
  const urlBase = context.DB_API_URL_BASE as string;
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
  newArtistName: string
): Promise<SimilarBannedArtistList> {
  const response: SimilarBannedArtistList = {
    similarArtists: [],
    exactMatchArtist: null,
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

  let bannedArtistsQuery = 'SELECT Name AS name from artist WHERE IsBanned = 1';

  let bannedArtists = await queryDbDirect<{ name: string }[]>(
    urlBase,
    bannedArtistsQuery
  );

  for (var bannedArtist of bannedArtists) {
    let distance = stringDistance(newArtistName, bannedArtist.name);
    if (distance === 0) {
      response.exactMatchArtist = bannedArtist.name;
    } else if (distance <= distanceThreshold) {
      response.similarArtists.push(bannedArtist.name);
    }
  }

  return response;
}
