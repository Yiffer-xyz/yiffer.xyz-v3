import { logout } from '../utils/auth.server';

export const action = async function ({ request }) {
  return logout(request);
};

export const loader = async function ({ request }) {
  return logout(request);
};
