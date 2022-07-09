import { ActionFunction, LoaderFunction } from '@remix-run/cloudflare';
import { logout } from '../utils/auth.server';

export const action: ActionFunction = async function ({ request }) {
  return logout(request);
};

export const loader: LoaderFunction = async function ({ request }) {
  return logout(request);
};
