import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { redirectIfNotLoggedIn } from '~/utils/loaders';
import { queryDbExec } from '~/utils/database-facade';
import { create400Json, createSuccessJson } from '~/utils/request-helpers';

export async function action(args: ActionFunctionArgs) {
  const user = await redirectIfNotLoggedIn(args);
  const formData = await args.request.formData();
  const notificationId = formData.get('notificationId');
  if (!notificationId) return create400Json('Missing notificationId');
  await queryDbExec(
    args.context.cloudflare.env.DB,
    'UPDATE usernotification SET isRead = 1 WHERE id = ? AND userId = ?',
    [notificationId, user.userId],
    'Mark notification as read'
  );
  return createSuccessJson();
} 