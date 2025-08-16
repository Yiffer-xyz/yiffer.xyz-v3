import type { ActionFunctionArgs } from '@remix-run/cloudflare';
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
  const { targetUserId, action: blockAction } = Object.fromEntries(reqBody);

  if (!targetUserId || !blockAction) {
    return create400Json('Missing target user ID or action');
  }

  const targetUserIdNum = Number(targetUserId);
  if (Number.isNaN(targetUserIdNum)) {
    return create400Json('Invalid target user ID');
  }

  if (targetUserIdNum === user.userId) {
    return create400Json('Cannot block yourself');
  }

  if (blockAction !== 'block' && blockAction !== 'unblock') {
    return create400Json('Invalid action. Must be "block" or "unblock"');
  }

  const err = await toggleUserBlock(
    args.context.cloudflare.env.DB,
    user.userId,
    targetUserIdNum,
    blockAction
  );

  if (err) {
    return processApiError('Error in /block-user', err, {
      targetUserId: targetUserIdNum,
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
