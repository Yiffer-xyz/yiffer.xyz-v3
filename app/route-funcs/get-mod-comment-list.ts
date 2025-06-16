import { ADMIN_COMMENTLIST_PAGE_SIZE } from '~/types/constants';
import type { ComicComment } from '~/types/types';
import { queryDb } from '~/utils/database-facade';
import { parseDbDateStr } from '~/utils/date-utils';
import { makeDbErrObj, type ResultOrErrorPromise } from '~/utils/request-helpers';

type DbComment = {
  id: number;
  comment: string;
  timestamp: string;
  comicId: number;
  comicName: string;
  isHidden: 0 | 1;
  userId: number;
  username: string;
  profilePictureToken: string;
};

export async function getModCommentList(
  db: D1Database,
  pageNum: number
): ResultOrErrorPromise<ComicComment[]> {
  const offset = (pageNum - 1) * ADMIN_COMMENTLIST_PAGE_SIZE;
  const query = `SELECT
      comiccomment.id AS id, comment, comiccomment.timestamp AS timestamp, comicId,
      comic.name AS comicName, comiccomment.isHidden,
      user.username, user.id AS userId, user.profilePictureToken
    FROM comiccomment 
    INNER JOIN user ON comiccomment.userId = user.id
    LEFT JOIN comic ON comiccomment.comicId = comic.id
    ORDER BY comiccomment.id DESC LIMIT ${ADMIN_COMMENTLIST_PAGE_SIZE} OFFSET ${offset}`;
  const result = await queryDb<DbComment[]>(db, query);

  if (result.isError) {
    return makeDbErrObj(result, 'Error getting mod comment list', { pageNum });
  }

  const mappedComments: ComicComment[] = result.result.map(dbRow => ({
    ...dbRow,
    timestamp: parseDbDateStr(dbRow.timestamp),
    isHidden: dbRow.isHidden === 1,
    user: {
      id: dbRow.userId,
      username: dbRow.username,
      profilePictureToken: dbRow.profilePictureToken,
    },
  }));

  return {
    result: mappedComments,
  };
}
