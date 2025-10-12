import type { Route } from './+types/mark-all-notifications-read';
import { redirectIfNotLoggedIn } from '~/utils/loaders';
import { queryDbExec } from '~/utils/database-facade';
import { createSuccessJson, noGetRoute } from '~/utils/request-helpers';

export { noGetRoute as loader };

export async function action(args: Route.ActionArgs) {
  const user = await redirectIfNotLoggedIn(args);

  await queryDbExec(
    args.context.cloudflare.env.DB,
    'UPDATE comicupdatenotification SET isRead = 1 WHERE userId = ?',
    [user.userId],
    'Mark all notifications as read'
  );

  return createSuccessJson();
}
