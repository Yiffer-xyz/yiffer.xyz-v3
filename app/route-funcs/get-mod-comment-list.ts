import { ADMIN_COMMENTLIST_PAGE_SIZE } from '~/types/constants';
import type { ComicComment } from '~/types/types';
import { mergeCommentsAndVotes } from '~/utils/comment-utils';
import { queryDb } from '~/utils/database-facade';
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

type DbCommentVote = {
  id: number;
  userId: number;
  commentId: number;
  isUpvote: 0 | 1;
};

export async function getModCommentList(
  db: D1Database,
  pageNum: number,
  currentUserId?: number
): ResultOrErrorPromise<ComicComment[]> {
  const offset = (pageNum - 1) * ADMIN_COMMENTLIST_PAGE_SIZE;
  const query = `SELECT
      comiccomment.id AS id, comment, comiccomment.timestamp AS timestamp, comicId,
      comic.name AS comicName, comiccomment.isHidden, comic.id AS comicId,
      user.username, user.id AS userId, user.profilePictureToken
    FROM comiccomment 
    INNER JOIN user ON comiccomment.userId = user.id
    LEFT JOIN comic ON comiccomment.comicId = comic.id
    ORDER BY comiccomment.id DESC LIMIT ${ADMIN_COMMENTLIST_PAGE_SIZE} OFFSET ${offset}`;
  const result = await queryDb<DbComment[]>(db, query, undefined, 'Mod comment list');

  if (result.isError) {
    return makeDbErrObj(result, 'Error getting mod comment list', { pageNum });
  }

  // Get relevant votes
  const commentVotesQuery = `SELECT
      comiccommentvote.id AS id,
      comiccommentvote.userId AS userId,
      comiccommentvote.commentId AS commentId,
      comiccommentvote.isUpvote AS isUpvote
    FROM comiccommentvote
    WHERE comiccommentvote.commentId IN (${result.result.map(_ => '?').join(',')})`;

  const votesParams = result.result.map(x => x.id);
  const votesResult = await queryDb<DbCommentVote[]>(
    db,
    commentVotesQuery,
    votesParams,
    'Mod comment votes'
  );

  if (votesResult.isError) {
    return makeDbErrObj(votesResult, 'Error getting comment votes', { pageNum });
  }

  const mappedComments = mergeCommentsAndVotes(
    result.result,
    votesResult.result,
    currentUserId
  );

  return {
    result: mappedComments.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
  };
}
