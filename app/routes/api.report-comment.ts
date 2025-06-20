import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { isModOrAdmin } from '~/types/types';
import { queryDb, queryDbExec } from '~/utils/database-facade';
import { redirectIfNotLoggedIn } from '~/utils/loaders';
import type { ApiError } from '~/utils/request-helpers';
import {
  create400Json,
  createSuccessJson,
  makeDbErr,
  noGetRoute,
  processApiError,
} from '~/utils/request-helpers';

export { noGetRoute as loader };

export async function action(args: ActionFunctionArgs) {
  const user = await redirectIfNotLoggedIn(args);

  const reqBody = await args.request.formData();
  const { commentId } = Object.fromEntries(reqBody);
  if (!commentId || Number.isNaN(Number(commentId))) {
    return create400Json('Missing fields');
  }

  if (isModOrAdmin(user)) {
    const err = await deleteComment(args.context.cloudflare.env.DB, Number(commentId));
    if (err)
      return processApiError('Error in /report-comment, mod hiding', err, {
        commentId: Number(commentId),
        userId: user.userId,
      });

    return createSuccessJson();
  }

  const err = await reportComment(
    args.context.cloudflare.env.DB,
    user.userId,
    Number(commentId)
  );
  if (err)
    return processApiError('Error in /report-comment', err, {
      commentId: Number(commentId),
      userId: user.userId,
    });

  return createSuccessJson();
}

async function deleteComment(
  db: D1Database,
  commentId: number
): Promise<ApiError | undefined> {
  const updateCommentQuery = `UPDATE comiccomment SET isHidden = 1 WHERE id = ?`;

  const dbRes = await queryDbExec(db, updateCommentQuery, [commentId], 'Delete comment');
  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error deleting comment');
  }

  const updateReportsQuery = `UPDATE comiccommentreport SET isProcessed = 1 WHERE commentId = ? AND isProcessed = 0`;

  const updateReportsRes = await queryDbExec(
    db,
    updateReportsQuery,
    [commentId],
    'Delete comment'
  );
  if (updateReportsRes.isError) {
    return makeDbErr(updateReportsRes, 'Error updating comment reports');
  }
}

async function reportComment(
  db: D1Database,
  userId: number,
  commentId: number
): Promise<ApiError | undefined> {
  const getReportQuery = `SELECT * FROM comiccommentreport WHERE userId = ? AND commentId = ?`;
  const getReportParams = [userId, commentId];

  const existingReportsRes = await queryDb<any[]>(
    db,
    getReportQuery,
    getReportParams,
    'Get report'
  );
  if (existingReportsRes.isError) {
    return makeDbErr(existingReportsRes, 'Error getting report');
  }
  if (existingReportsRes.result.length > 0) {
    return;
  }

  const query = `INSERT INTO comiccommentreport (userId, commentId) VALUES (?, ?)`;
  const params = [userId, commentId];

  const dbRes = await queryDbExec(db, query, params, 'Report comment');
  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error reporting comment');
  }
}
