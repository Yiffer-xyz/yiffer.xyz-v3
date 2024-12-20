import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { redirect } from '@remix-run/cloudflare';
import { getUserSession } from './auth.server';
import { getUserById } from '~/route-funcs/get-user';
import { processApiError } from './request-helpers';

// A way to get the user session. Can be awaited as a normal func,
// but can also be exported directly if a route needs no other loader.
// Like this: export { authLoader as loader }
export async function authLoader(args: LoaderFunctionArgs) {
  const userSession = await getUserSession(
    args.request,
    args.context.cloudflare.env.JWT_CONFIG_STR
  );
  return userSession;
}

export async function fullUserLoader(args: LoaderFunctionArgs) {
  const user = await authLoader(args);
  if (!user) throw redirect('/');

  const fullUserRes = await getUserById(args.context.cloudflare.env.DB, user.userId);
  if (fullUserRes.err) {
    return processApiError('Error getting user in userLoader', fullUserRes.err);
  }

  return fullUserRes.result;
}

export async function redirectIfNotLoggedIn(args: LoaderFunctionArgs) {
  const user = await authLoader(args);
  if (!user) throw redirect('/login');
  return user;
}

export async function redirectIfLoggedIn(args: LoaderFunctionArgs) {
  const user = await authLoader(args);
  if (user) throw redirect('/');
  return user;
}

export async function redirectIfNotMod(args: LoaderFunctionArgs) {
  const user = await authLoader(args);
  if (user?.userType !== 'moderator' && user?.userType !== 'admin') {
    throw redirect('/');
  }
  return user;
}

export async function redirectIfNotAdmin(args: LoaderFunctionArgs) {
  const user = await authLoader(args);
  if (user?.userType !== 'admin') {
    throw redirect('/');
  }
  return user;
}
