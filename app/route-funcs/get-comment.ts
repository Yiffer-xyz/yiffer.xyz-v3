import { queryDb } from '~/utils/database-facade';
import { parseDbDateStr } from '~/utils/date-utils';
import {
  makeDbErrObj,
  type ResultOrNotFoundOrErrorPromise,
} from '~/utils/request-helpers';

type SimpleComment = {
  id: number;
  comment: string;
  userId: number;
  timestamp: Date;
  isHidden: boolean;
};

type DbSimpleComment = Omit<SimpleComment, 'timestamp' | 'isHidden'> & {
  timestamp: string;
  isHidden: 0 | 1;
};

export async function getSimpleComment(
  db: D1Database,
  commentId: number
): ResultOrNotFoundOrErrorPromise<SimpleComment> {
  const query = `SELECT id, comment, userId, timestamp, isHidden FROM comiccomment WHERE id = ?`;
  const params = [commentId];
  const dbRes = await queryDb<DbSimpleComment[]>(db, query, params, 'Get comment');

  if (dbRes.isError) {
    return makeDbErrObj(dbRes, 'Error getting comment');
  }

  if (dbRes.result.length === 0 || dbRes.result[0].id === null) {
    return { notFound: true };
  }

  return {
    result: {
      id: dbRes.result[0].id,
      comment: dbRes.result[0].comment,
      userId: dbRes.result[0].userId,
      timestamp: parseDbDateStr(dbRes.result[0].timestamp),
      isHidden: dbRes.result[0].isHidden === 1,
    },
  };
}
