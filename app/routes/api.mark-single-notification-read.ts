import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { redirectIfNotLoggedIn } from '~/utils/loaders';
import {
  create400Json,
  createSuccessJson,
  noGetRoute,
  processApiError,
} from '~/utils/request-helpers';
import { markSingleNotificationRead } from '~/route-funcs/mark-single-notification-read';

export { noGetRoute as loader };

export async function action(args: ActionFunctionArgs) {
  const user = await redirectIfNotLoggedIn(args);

  const body = await args.request.formData();
  const bodyNotifId = body.get('id');

  if (!bodyNotifId) return create400Json('No id provided');

  const notifId = parseInt(bodyNotifId.toString());
  if (isNaN(notifId)) return create400Json('Invalid id');

  const err = await markSingleNotificationRead(
    args.context.cloudflare.env.DB,
    user.userId,
    notifId
  );
  if (err) {
    return processApiError('Error marking notification as read', err, { notifId });
  }

  return createSuccessJson();
}
