// import bcrypt from 'bcryptjs';
import { createCookieSessionStorage, redirect, SessionStorage } from '@remix-run/cloudflare';
import jwt from '@tsndr/cloudflare-worker-jwt';
import { JwtConfig } from '~/types/types';

export async function login(username: string, password: string, jwtConfigStr: string) {
  // TODO find user, check password with bcrypt
  const userFromDb = { id: 1, username: 'Melon' };
  return await createUserSession(userFromDb.id, userFromDb.username, jwtConfigStr);
}

// To only get the user data - {userId, username, token (auth)}
// Basically, use this from components/routes
export async function getUserSessionData(request: Request, jwtConfigStr: string) {
  const session = await getUserSession(request, jwtConfigStr);
  if (session && session.data) {
    return session.data;
  }
  return null;
}

// To get the full session object, needed when manipulating the session itself
export async function getUserSession(request: Request, jwtConfigstr: string) {
  const jwtConfig: JwtConfig = JSON.parse(jwtConfigstr);
  const storage = createCookieSessionStorage({
    cookie: jwtConfig.cookie,
  });
  const session = await storage.getSession(request.headers.get('cookie'));
  const token = session.get('token');

  if (!token) {
    return null;
  }

  const isTokenValid = await jwt.verify(token, jwtConfig.tokenSecret);
  if (!isTokenValid) {
    storage.destroySession(session);
    return null;
  }

  return session;
}

export async function getUser(request: Request, jwtConfigStr: string) {
  const userId = await getUserId(request, jwtConfigStr);
  if (userId === null) {
    return null;
  }

  // TODO lookup full user in db
  const userFromDb = { id: 1, username: 'Melon' };
  return userFromDb;
}

export async function getUserId(request: Request, jwtConfigStr: string) {
  const session = await getUserSession(request, jwtConfigStr);
  if (!session) {
    return null;
  }
  const userId = session.get('userId');
  if (!userId || typeof userId !== 'string') {
    return null;
  }
  return userId;
}

// Place in the loader of routes requiring a logged in user
export async function requireUserId(request: Request, jwtConfigStr: string) {
  const session = await getUserSession(request, jwtConfigStr);
  if (!session) {
    throw redirect(`/`);
  }
  const userId = session.get('userId');
  if (!userId || typeof userId !== 'string') {
    throw redirect(`/`);
  }
  return userId;
}

export async function logout(request: Request, jwtConfigStr: string) {
  const jwtConfig: JwtConfig = JSON.parse(jwtConfigStr);
  const session = await getUserSession(request, jwtConfigStr);
  if (!session) {
    return redirect('/');
  }
  const storage = createCookieSessionStorage({
    cookie: jwtConfig.cookie,
  });
  return redirect('/', {
    headers: {
      'Set-Cookie': await storage.destroySession(session),
    },
  });
}

export async function createUserSession(userId: number, username: string, jwtConfigStr: string) {
  const jwtConfig: JwtConfig = JSON.parse(jwtConfigStr);
  const storage = createCookieSessionStorage({
    cookie: jwtConfig.cookie,
  });
  const session = await storage.getSession();
  const token = await jwt.sign({ userId }, jwtConfig.tokenSecret);
  session.set('token', token);
  session.set('userId', userId);
  session.set('username', username);

  const cookie = await storage.commitSession(session);

  return redirect('/', {
    headers: {
      'Set-Cookie': cookie,
    },
  });
}
