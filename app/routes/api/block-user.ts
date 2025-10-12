import type { Route } from './+types/block-user';
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
import { validateFormDataNumber } from '~/utils/string-utils';

export { noGetRoute as loader };

export async function action(args: Route.ActionArgs) {
  const user = await redirectIfNotLoggedIn(args);

  const reqBody = await args.request.formData();
  const blockAction = reqBody.get('action');
  const targetUserId = validateFormDataNumber(reqBody, 'targetUserId');

  if (!targetUserId || !blockAction) {
    return create400Json('Missing target user ID or action');
  }

  if (targetUserId === user.userId) {
    return create400Json('Cannot block yourself');
  }

  if (blockAction !== 'block' && blockAction !== 'unblock') {
    return create400Json('Invalid action. Must be "block" or "unblock"');
  }

  const err = await toggleUserBlock(
    args.context.cloudflare.env.DB,
    user.userId,
    targetUserId,
    blockAction
  );

  if (err) {
    return processApiError('Error in /block-user', err, {
      targetUserId,
      action: blockAction,
      userId: user.userId,
    });
  }

  return createSuccessJson();
}

async function toggleUserBlock(
  db: D1Database,
  blockerId: number,
  targetUserId: number,
  action: 'block' | 'unblock'
): Promise<ApiError | undefined> {
  if (action === 'block') {
    // Check if already blocked
    const existingBlockRes = await queryDb<{ id: number }[]>(
      db,
      `SELECT id FROM userblock WHERE blockerId = ? AND blockedUserId = ?`,
      [blockerId, targetUserId],
      'Check existing block'
    );

    if (existingBlockRes.isError) {
      return makeDbErr(existingBlockRes, 'Error checking existing block');
    }

    if (existingBlockRes.result.length > 0) {
      // Already blocked, no action needed
      return;
    }

    // Add new block
    const insertQuery = `INSERT INTO userblock (blockerId, blockedUserId) VALUES (?, ?)`;
    const insertParams = [blockerId, targetUserId];

    const dbRes = await queryDbExec(db, insertQuery, insertParams, 'Add user block');
    if (dbRes.isError) {
      return makeDbErr(dbRes, 'Error adding user block');
    }
  } else {
    // action === 'unblock'
    const deleteQuery = `DELETE FROM userblock WHERE blockerId = ? AND blockedUserId = ?`;
    const deleteParams = [blockerId, targetUserId];

    const dbRes = await queryDbExec(db, deleteQuery, deleteParams, 'Remove user block');
    if (dbRes.isError) {
      return makeDbErr(dbRes, 'Error removing user block');
    }
  }
}
