import { ArtistTiny } from '~/types/types';
import { queryDb } from '~/utils/database-facade';
import { ApiError, makeDbErrObj } from '~/utils/request-helpers';

export async function getAllArtists(
  urlBase: string,
  options: {
    modifyNameIncludeType?: boolean;
    includePending?: boolean;
    includeBanned?: boolean;
  }
): Promise<{ err?: ApiError; artists?: ArtistTiny[] }> {
  let query = `SELECT
      id,
      name,
      patreonName,
      e621Name,
      isPending,
      isBanned
    FROM artist
    WHERE isRejected = 0`;

  if (!options.includePending) {
    query += ' AND IsPending = 0';
  }
  if (!options.includeBanned) {
    query += ' AND IsBanned = 0';
  }

  const artistsRes = await queryDb<ArtistTiny[]>(urlBase, query);
  if (artistsRes.isError) {
    return makeDbErrObj(artistsRes, 'Error getting artists from db', options);
  }

  const boolArtists = artistsRes.result!.map(artist => {
    artist.isPending = !!artist.isPending;
    artist.isBanned = !!artist.isBanned;
    return artist;
  });

  if (!options.modifyNameIncludeType) return { artists: boolArtists };

  const mappedArtists = boolArtists.map(artist => {
    if (artist.isPending) {
      artist.name = artist.name + ' (PENDING)';
    }
    if (artist.isBanned) {
      artist.name = artist.name + ' (BANNED)';
    }
    return artist;
  });

  return { artists: mappedArtists };
}
