import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { MAX_COMMENT_LENGTH } from '~/types/constants';
import { queryDbExec } from '~/utils/database-facade';
import { redirectIfNotLoggedIn } from '~/utils/loaders';
import type { ApiError } from '~/utils/request-helpers';
import { returnIfRestricted } from '~/utils/restriction-utils.server';
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
  const { comment, comicId } = Object.fromEntries(reqBody);
  if (!comment || Number.isNaN(Number(comicId))) {
    return create400Json('Missing fields');
  }

  if (comment.toString().length > MAX_COMMENT_LENGTH) {
    return create400Json('Comment is too long');
  }

  const returnRes = await returnIfRestricted(args, '/add-comment', 'comment');
  if (returnRes) return returnRes;

  const err = await addComment(
    args.context.cloudflare.env.DB,
    user.userId,
    comment.toString(),
    Number(comicId)
  );
  if (err)
    return processApiError('Error in /add-comment', err, {
      comment,
      comicId,
      userId: user.userId,
    });

  return createSuccessJson();
}

async function addComment(
  db: D1Database,
  userId: number,
  comment: string,
  comicId: number
): Promise<ApiError | undefined> {
  const query = `INSERT INTO comiccomment (userId, comment, comicId) VALUES (?, ?, ?)`;
  const params = [userId, comment, comicId];

  const dbRes = await queryDbExec(db, query, params, 'Add comment');
  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error adding comment');
  }
}
