import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { logout } from '~/utils/auth.server';

export async function loader(args: LoaderFunctionArgs) {
  return logout(args.context.cloudflare.env.JWT_CONFIG_STR);
}

export async function action(args: ActionFunctionArgs) {
  return logout(args.context.cloudflare.env.JWT_CONFIG_STR);
}
