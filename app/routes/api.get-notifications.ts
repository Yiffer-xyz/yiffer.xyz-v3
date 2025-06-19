import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { redirectIfNotLoggedIn } from '~/utils/loaders';
import { getUserNotifications } from '~/route-funcs/get-user';

export async function loader(args: ActionFunctionArgs) {
  const user = await redirectIfNotLoggedIn(args);
  const notifications = await getUserNotifications(args.context.cloudflare.env.DB, user.userId);
  return new Response(JSON.stringify(notifications), {
    headers: { 'Content-Type': 'application/json' },
  });
} 