import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { queryDb } from '~/utils/database-facade';
import { redirectIfNotLoggedIn } from '~/utils/loaders';
import { createSuccessJson, makeDbErr, processApiError } from '~/utils/request-helpers';

export async function loader(args: LoaderFunctionArgs) {
  const user = await redirectIfNotLoggedIn(args);

  const query = `SELECT COUNT(*) AS count FROM usermessage WHERE toUserId = ? AND isRead = 0`;

  const dbRes = await queryDb<{ count: number }[]>(
    args.context.cloudflare.env.DB,
    query,
    [user.userId],
    'Unread message count'
  );

  if (dbRes.isError) {
    return processApiError('Error in /api/get-messages', makeDbErr(dbRes), {
      userId: user.userId,
    });
  }

  return createSuccessJson({
    unreadCount: dbRes.result[0].count,
  });
}
