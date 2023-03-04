import { LoaderArgs, redirect } from '@remix-run/cloudflare';
import { getUserSession } from './auth.server';

export async function authLoader(args: LoaderArgs) {
  const userSession = await getUserSession(
    args.request,
    args.context.JWT_CONFIG_STR as string
  );
  const data = {
    user: userSession,
  };
  return data;
}

export async function redirectIfNotLoggedIn(args: LoaderArgs) {
  const userObj = await authLoader(args);
  if (!userObj || !userObj.user) throw redirect('/');
  else return null;
}

export async function redirectIfNotMod(args: LoaderArgs) {
  const userObj = await authLoader(args);
  if (
    !userObj ||
    !userObj.user ||
    (userObj.user.userType !== 'moderator' && userObj.user.userType !== 'admin')
  ) {
    throw redirect('/');
  } else return null;
}

export async function redirectIfNotAdmin(args: LoaderArgs) {
  const userObj = await authLoader(args);
  if (!userObj || !userObj.user || userObj.user.userType !== 'admin') {
    throw redirect('/');
  } else return null;
}
