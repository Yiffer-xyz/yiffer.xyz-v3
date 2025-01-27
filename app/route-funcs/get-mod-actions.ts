import type { ModAction } from '~/types/types';
import { queryDb } from '~/utils/database-facade';
import { parseDbDateStr } from '~/utils/date-utils';
import { makeDbErrObj, type ResultOrErrorPromise } from '~/utils/request-helpers';

const PAGE_SIZE = 50;

type DbModAction = Omit<ModAction, 'timestamp' | 'user' | 'comic' | 'artist'> & {
  timestamp: string;
  userId: number;
  username: string;
  comicId?: number;
  comicName?: string;
  artistId?: number;
  artistName?: string;
};

export async function getModActions(
  db: D1Database,
  pageNum: number
): ResultOrErrorPromise<ModAction[]> {
  const offset = (pageNum - 1) * PAGE_SIZE;
  const query = `SELECT
      comicId, artistId, text, actionType, points, timestamp,
      user.username, user.id AS userId,
      comic.name AS comicName, comic.id AS comicId,
      artist.name AS artistName, artist.id AS artistId
    FROM modaction 
    INNER JOIN user ON modaction.userId = user.id
    LEFT JOIN comic ON modaction.comicId = comic.id
    LEFT JOIN artist ON modaction.artistId = artist.id
    ORDER BY modaction.id DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`;
  const result = await queryDb<DbModAction[]>(db, query);

  if (result.isError) {
    return makeDbErrObj(result, 'Error getting mod actions', { pageNum });
  }

  return {
    result: result.result.map(a => ({
      ...a,
      timestamp: parseDbDateStr(a.timestamp),
      user: {
        id: a.userId,
        username: a.username,
      },
      comic: a.comicId ? { id: a.comicId, name: a.comicName! } : undefined,
      artist: a.artistId ? { id: a.artistId, name: a.artistName! } : undefined,
    })),
  };
}
