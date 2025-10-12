import type { Route } from './+types/add-comment-vote';
import { queryDb, queryDbExec } from '~/utils/database-facade';
import { redirectIfNotLoggedIn } from '~/utils/loaders';
import { type ApiError, noGetRoute } from '~/utils/request-helpers';
import {
  create400Json,
  createSuccessJson,
  makeDbErr,
  processApiError,
} from '~/utils/request-helpers';

export { noGetRoute as loader };

export async function action(args: Route.ActionArgs) {
  const user = await redirectIfNotLoggedIn(args);
  const formData = await args.request.formData();
  const formCommentId = formData.get('commentId');
  const formIsUpvote = formData.get('isUpvote');
  // Redundant, but helps query performance
  const formComicId = formData.get('comicId');

  if (!formCommentId || !formIsUpvote || !formComicId) {
    return create400Json('Missing comment ID, isUpvote, or comic ID');
  }

  const commentId = parseInt(formCommentId.toString());
  const isUpvote = formIsUpvote.toString() === 'true';
  const comicId = parseInt(formComicId.toString());

  const err = await addCommentVote(
    args.context.cloudflare.env.DB,
    user.userId,
    commentId,
    comicId,
    isUpvote
  );
  if (err) {
    return processApiError('Error in /add-comment-vote', err, {
      commentId,
      isUpvote,
      comicId,
      userId: user.userId,
    });
  }
  return createSuccessJson();
}

export async function addCommentVote(
  db: D1Database,
  userId: number,
  commentId: number,
  comicId: number,
  isUpvote: boolean
): Promise<ApiError | undefined> {
  const existingVoteRes = await queryDb<{ id: number; isUpvote: 0 | 1 }[]>(
    db,
    `SELECT id, isUpvote FROM comiccommentvote WHERE userId = ? AND commentId = ?`,
    [userId, commentId],
    'Get existing vote'
  );

  if (existingVoteRes.isError) {
    return makeDbErr(existingVoteRes, 'Error getting existing vote');
  }

  const existingVote = existingVoteRes.result.length
    ? existingVoteRes.result[0].isUpvote === 1
      ? true
      : false
    : null;

  if (existingVote !== null) {
    // If same vote, toggle it off (just delete it)
    if (existingVote === isUpvote) {
      const query = `DELETE FROM comiccommentvote WHERE id = ?`;
      const params = [existingVoteRes.result[0].id];
      const dbRes = await queryDbExec(db, query, params, 'Delete vote');
      if (dbRes.isError) return makeDbErr(dbRes, 'Error deleting vote');
      return;
    }

    // If different vote, change the boolean
    const query = `UPDATE comiccommentvote SET isUpvote = ? WHERE id = ?`;
    const params = [isUpvote, existingVoteRes.result[0].id];
    const dbRes = await queryDbExec(db, query, params, 'Update vote');
    if (dbRes.isError) return makeDbErr(dbRes, 'Error updating vote');
    return;
  }

  // If no existing vote, add new
  const query = `INSERT INTO comiccommentvote (userId, commentId, comicId, isUpvote) VALUES (?, ?, ?, ?)`;
  const params = [userId, commentId, comicId, isUpvote];
  const dbRes = await queryDbExec(db, query, params, 'Add vote');
  if (dbRes.isError) return makeDbErr(dbRes, 'Error adding vote');
}
