import { ArtistTiny } from '~/types/types';
import { queryDbDirect } from '~/utils/database-facade';

export async function getAllArtists(
  urlBase: string,
  options: {
    modifyNameIncludeType?: boolean;
    includePending?: boolean;
    includeBanned?: boolean;
  }
): Promise<ArtistTiny[]> {
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

  const artists = await queryDbDirect<ArtistTiny[]>(urlBase, query);
  const boolArtists = artists.map(artist => {
    artist.isPending = !!artist.isPending;
    artist.isBanned = !!artist.isBanned;
    return artist;
  });

  if (!options.modifyNameIncludeType) return boolArtists;

  const mappedArtists = boolArtists.map(artist => {
    if (artist.isPending) {
      artist.name = artist.name + ' (PENDING)';
    }
    if (artist.isBanned) {
      artist.name = artist.name + ' (BANNED)';
    }
    return artist;
  });

  return mappedArtists;
}
