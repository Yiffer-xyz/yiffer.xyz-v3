import { getUserBlockStatus } from './get-user-block-status';
import { wrapApiError, type ResultOrErrorPromise } from '~/utils/request-helpers';

export async function canSendMessage(
  db: D1Database,
  fromUserId: number,
  toUserId: number
): Promise<ResultOrErrorPromise<boolean>> {
  // Check if the recipient has blocked the sender
  const blockResult = await getUserBlockStatus(db, fromUserId, toUserId);

  if (blockResult.err) {
    return {
      err: wrapApiError(blockResult.err, 'Error checking if user can send message'),
    };
  }

  if (blockResult.result) {
    // There's some block - can't send regardless of direction.
    return { result: false };
  }

  // Check if the recipient allows messages
  const recipientQuery = `SELECT allowMessages FROM user WHERE id = ?`;
  const recipientResult = await db
    .prepare(recipientQuery)
    .bind(toUserId)
    .first<{ allowMessages: number }>();

  if (!recipientResult) {
    return { err: { logMessage: 'Recipient user not found' } };
  }

  const canReceiveMessages = recipientResult.allowMessages === 1;

  return { result: canReceiveMessages };
}
