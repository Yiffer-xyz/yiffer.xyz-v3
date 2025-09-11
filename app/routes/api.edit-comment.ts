import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { redirectIfNotLoggedIn } from '~/utils/loaders';
import type { ApiError } from '~/utils/request-helpers';
import {
  create400Json,
  createSuccessJson,
  makeDbErr,
  noGetRoute,
  processApiError,
} from '~/utils/request-helpers';
import { validateFormDataNumber } from '~/utils/string-utils';
import { getSimpleComment } from '~/route-funcs/get-comment';
import { queryDbExec } from '~/utils/database-facade';

export { noGetRoute as loader };

export async function action(args: ActionFunctionArgs) {
  const user = await redirectIfNotLoggedIn(args);

  const reqBody = await args.request.formData();
  const commentId = validateFormDataNumber(reqBody, 'commentId');
  if (!commentId) {
    return create400Json('Missing comment id');
  }
  const newComment = reqBody.get('newComment') as string;
  if (!newComment) {
    return create400Json('Missing new comment');
  }

  const commentRes = await getSimpleComment(args.context.cloudflare.env.DB, commentId);
  if (commentRes.err) {
    return processApiError('Error in /edit-comment', commentRes.err, {
      commentId: commentId,
      userId: user.userId,
    });
  }
  if (commentRes.notFound) {
    return create400Json('Comment not found');
  }

  const isCommentOwner = commentRes.result.userId === user.userId;

  if (!isCommentOwner) {
    return create400Json('Not authorized to edit this comment');
  }

  const err = await editComment(args.context.cloudflare.env.DB, commentId, newComment);
  if (err) {
    return processApiError('Error in /edit-comment', err, {
      commentId: commentId,
      userId: user.userId,
    });
  }

  return createSuccessJson();
}

async function editComment(
  db: D1Database,
  commentId: number,
  newComment: string
): Promise<ApiError | undefined> {
  const query = `UPDATE comiccomment SET comment = ? WHERE id = ?`;
  const params = [newComment, commentId];
  const dbRes = await queryDbExec(db, query, params, 'Edit comment');
  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error editing comment');
  }
}
