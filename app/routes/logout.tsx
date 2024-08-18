import { unstable_defineAction, unstable_defineLoader } from '@remix-run/cloudflare';
import { logout } from '../utils/auth.server';

export const loader = unstable_defineLoader(async args => {
  return logout(args.context.cloudflare.env.JWT_CONFIG_STR);
});

export const action = unstable_defineAction(async args => {
  return logout(args.context.cloudflare.env.JWT_CONFIG_STR);
});
