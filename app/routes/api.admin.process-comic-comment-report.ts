import { queryDb, queryDbExec } from '~/utils/database-facade';
import { parseFormJson } from '~/utils/formdata-parser';
import type { ApiError, noGetRoute } from '~/utils/request-helpers';
import { createSuccessJson, makeDbErr, processApiError } from '~/utils/request-helpers';
import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { addModLogAndPoints } from '~/route-funcs/add-mod-log-and-points';

export { noGetRoute as loader };

export type ProcessComicCommentReportBody = {
  actionId: number;
  shouldHideComment: boolean;
  comicId: number;
};

export async function action(args: ActionFunctionArgs) {
  const { fields, isUnauthorized, user } =
    await parseFormJson<ProcessComicCommentReportBody>(args, 'mod');
  if (isUnauthorized || !user) return new Response('Unauthorized', { status: 401 });

  const err = await processComicCommentReport(
    args.context.cloudflare.env.DB,
    fields.shouldHideComment,
    fields.actionId,
    user.userId
  );

  if (err)
    return processApiError('Error in /process-comic-comment-report', err, {
      ...fields,
    });

  const modLogErr = await addModLogAndPoints({
    db: args.context.cloudflare.env.DB,
    userId: user.userId,
    comicId: fields.comicId,
    dashboardActionId: fields.actionId,
    actionType: 'comic-comment-report-processed',
    text: `${fields.shouldHideComment ? 'Hidden' : 'Kept'}`,
  });
  if (modLogErr) {
    return processApiError('Error in /process-comic-comment-report', modLogErr);
  }

  return createSuccessJson();
}

async function processComicCommentReport(
  db: D1Database,
  shouldHideComment: boolean,
  actionId: number,
  modId: number
): Promise<ApiError | undefined> {
  const getCommentIdQuery = `SELECT commentId FROM comiccommentreport WHERE id = ?`;
  const commentIdDbRes = await queryDb<{ commentId: number }[]>(
    db,
    getCommentIdQuery,
    [actionId],
    'Getting comment id'
  );
  if (commentIdDbRes.isError) {
    return makeDbErr(commentIdDbRes, 'Error getting comment id');
  }
  if (commentIdDbRes.result.length === 0) {
    return { logMessage: 'Comment not found' };
  }
  const commentId = commentIdDbRes.result[0].commentId;

  const updateReportQuery = `UPDATE comiccommentreport SET isProcessed = 1, modId = ? WHERE id = ?`;
  const updateReportQueryParams = [modId, actionId];

  const updateReportDbRes = await queryDbExec(
    db,
    updateReportQuery,
    updateReportQueryParams,
    'Comic comment report processing'
  );
  if (updateReportDbRes.isError) {
    return makeDbErr(updateReportDbRes, 'Error updating comic comment report');
  }

  if (shouldHideComment) {
    const hideCommentQuery = `UPDATE comiccomment SET isHidden = 1 WHERE id = ?`;

    const hideCommentDbRes = await queryDbExec(
      db,
      hideCommentQuery,
      [commentId],
      'Hiding comic comment'
    );
    if (hideCommentDbRes.isError) {
      return makeDbErr(hideCommentDbRes, 'Error hiding comic comment');
    }
  }

  const deleteOtherReportsQuery = `DELETE FROM comiccommentreport
    WHERE commentId = ? AND id != ? AND isProcessed = 0`;
  const deleteOtherReportsQueryParams = [commentId, actionId];

  const deleteOtherReportsDbRes = await queryDbExec(
    db,
    deleteOtherReportsQuery,
    deleteOtherReportsQueryParams,
    'Deleting other comic comment reports'
  );
  if (deleteOtherReportsDbRes.isError) {
    return makeDbErr(
      deleteOtherReportsDbRes,
      'Error deleting other comic comment reports'
    );
  }

  return undefined;
}
