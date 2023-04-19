import { LoaderArgs, redirect } from '@remix-run/cloudflare';
import { getUserSession } from './auth.server';

// A way to get the user session. Can be awaited as a normal func,
// but can also be exported directly if a route needs no other loader.
// Like this: export { authLoader as loader }
export async function authLoader(args: LoaderArgs) {
  const userSession = await getUserSession(args.request, args.context.JWT_CONFIG_STR);
  return userSession;
}

export async function redirectIfNotLoggedIn(args: LoaderArgs) {
  const user = await authLoader(args);
  if (!user) throw redirect('/');
  return user;
}

export async function redirectIfLoggedIn(args: LoaderArgs) {
  const user = await authLoader(args);
  if (user) throw redirect('/');
  return user;
}

export async function redirectIfNotMod(args: LoaderArgs) {
  const user = await authLoader(args);
  if (user?.userType !== 'moderator' && user?.userType !== 'admin') {
    throw redirect('/');
  }
  return user;
}

export async function redirectIfNotAdmin(args: LoaderArgs) {
  const user = await authLoader(args);
  if (user?.userType !== 'admin') {
    throw redirect('/');
  }
  return user;
}
