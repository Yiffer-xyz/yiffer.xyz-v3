import { parseDbDateStr } from './date-utils';
import type { ComicComment } from '~/types/types';

export type DbComment = {
  id: number;
  comicId: number;
  userId: number;
  comment: string;
  timestamp: string;
  username: string;
  profilePictureToken?: string | null;
  isHidden?: 0 | 1;
};

export type DbCommentVote = {
  id: number;
  userId: number;
  commentId: number;
  isUpvote: 0 | 1;
};

export function mergeCommentsAndVotes(
  dbCommentsRows: DbComment[],
  dbCommentVotesRows: DbCommentVote[],
  userId?: number
): ComicComment[] {
  return dbCommentsRows
    .map(comment => {
      let score = 0;
      let yourVote: boolean | undefined = undefined;
      for (const vote of dbCommentVotesRows) {
        if (vote.commentId === comment.id) {
          score += vote.isUpvote ? 1 : -1;
          if (vote.userId === userId) {
            yourVote = vote.isUpvote === 1;
          }
        }
      }
      return {
        ...comment,
        timestamp: parseDbDateStr(comment.timestamp),
        isHidden: comment.isHidden === 1,
        user: {
          id: comment.userId,
          username: comment.username,
          profilePictureToken: comment.profilePictureToken,
        },
        score,
        yourVote,
      };
    })
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}
