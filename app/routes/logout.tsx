import { ActionArgs, LoaderArgs } from '@remix-run/cloudflare';
import { logout } from '../utils/auth.server';

export async function action(args: ActionArgs) {
  return logout(args.context.JWT_CONFIG_STR);
}

export function loader(args: LoaderArgs) {
  return logout(args.context.JWT_CONFIG_STR);
}
