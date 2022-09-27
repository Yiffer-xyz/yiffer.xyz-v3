import { ActionFunction, LoaderFunction } from '@remix-run/cloudflare';
import { logout } from '../utils/auth.server';

export const action: ActionFunction = async function ({ request, context }) {
  return logout(request, context.JWT_CONFIG_STR);
};

export const loader: LoaderFunction = async function ({ request, context }) {
  return logout(request, context.JWT_CONFIG_STR);
};
