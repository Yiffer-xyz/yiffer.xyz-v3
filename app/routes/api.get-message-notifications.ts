import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { queryDb } from '~/utils/database-facade';
import { redirectIfNotLoggedIn } from '~/utils/loaders';
import { createSuccessJson, makeDbErr, processApiError } from '~/utils/request-helpers';

export async function loader(args: LoaderFunctionArgs) {
  const user = await redirectIfNotLoggedIn(args);

  const query = `SELECT * FROM chatnotification WHERE userId = ?`;

  const dbRes = await queryDb<any[]>(
    args.context.cloudflare.env.DB,
    query,
    [user.userId],
    'Get chat notification count'
  );

  if (dbRes.isError) {
    return processApiError('Error in /api/get-message-notifications', makeDbErr(dbRes), {
      userId: user.userId,
    });
  }

  return createSuccessJson({ hasUnreads: dbRes.result.length > 0 });
}
