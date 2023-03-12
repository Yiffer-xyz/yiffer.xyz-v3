import { ArtistTiny } from '~/types/types';
import { queryDbDirect } from '~/utils/database-facade';

export async function getAllArtists(
  urlBase: string,
  options: {
    includePending?: boolean;
    includeBanned?: boolean;
  }
): Promise<ArtistTiny[]> {
  let query = `SELECT
      Id AS id,
      Name AS name,
      PatreonName AS patreonName,
      E621Name AS e621Name,
      IsPending as isPending,
      IsBanned as isBanned
    FROM artist`;

  if (!options.includePending && !options.includeBanned) {
    query += ' WHERE IsPending = 0 AND IsBanned = 0';
  }
  if (!options.includePending && options.includeBanned) {
    query += ' WHERE IsPending = 0';
  }
  if (options.includeBanned && !options.includePending) {
    query += ' WHERE IsBanned = 0';
  }

  return queryDbDirect<ArtistTiny[]>(urlBase, query);
}
