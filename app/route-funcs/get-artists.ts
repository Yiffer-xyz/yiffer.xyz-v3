import type { ArtistTiny } from '~/types/types';
import type { QueryWithParams } from '~/utils/database-facade';
import { queryDb } from '~/utils/database-facade';
import type { ResultOrErrorPromise } from '~/utils/request-helpers';
import { makeDbErrObj } from '~/utils/request-helpers';

// NOTE: Results after db fetch should go through mapArtistTiny()
export function getAllArtistsQuery(options: {
  modifyNameIncludeType?: boolean;
  includePending?: boolean;
  includeBanned?: boolean;
}): QueryWithParams {
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

  return { query, queryName: 'Artists, all' };
}

export function mapArtistTiny(
  artistTinys: ArtistTiny[],
  modifyNameIncludeType?: boolean
): ArtistTiny[] {
  const boolArtists = artistTinys.map(artist => {
    artist.isPending = !!artist.isPending;
    artist.isBanned = !!artist.isBanned;
    return artist;
  });

  if (!modifyNameIncludeType) return boolArtists;

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

export async function getAllArtists(
  db: D1Database,
  options: {
    modifyNameIncludeType?: boolean;
    includePending?: boolean;
    includeBanned?: boolean;
  }
): ResultOrErrorPromise<ArtistTiny[]> {
  const { query } = getAllArtistsQuery(options);

  const artistsRes = await queryDb<ArtistTiny[]>(db, query, null, 'Artists, all');
  if (artistsRes.isError || !artistsRes.result) {
    return makeDbErrObj(artistsRes, 'Error getting artists from db', options);
  }

  return { result: mapArtistTiny(artistsRes.result, options.modifyNameIncludeType) };
}
