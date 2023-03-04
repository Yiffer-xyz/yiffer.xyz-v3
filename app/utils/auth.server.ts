// import bcrypt from 'bcryptjs';
import { redirect } from '@remix-run/cloudflare';
import jwt from '@tsndr/cloudflare-worker-jwt';
import { JwtConfig, User, UserSession } from '~/types/types';

export async function login(
  username: string,
  password: string,
  urlBase: string,
  jwtConfigStr: string
): Promise<boolean | Response> {
  const response = await fetch(`${urlBase}/api/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  if (response.status !== 200) {
    return false;
  }

  const userFromApi = await response.json();
  const userFromApiParsed = userFromApi as User;
  return createUserSession(userFromApiParsed, jwtConfigStr);
}

// To get the user data - {userId, username}
// Basically, use this from components/routes
export async function getUserSession(
  request: Request,
  jwtConfigstr: string
): Promise<UserSession | null> {
  const jwtConfig: JwtConfig = JSON.parse(jwtConfigstr);
  const allCookies = request.headers.get('cookie');

  const sessionCookieContent = cookiesStringToYifferSessionCookie(
    allCookies,
    jwtConfig.cookie.name
  );
  if (!sessionCookieContent) {
    return null;
  }

  const isTokenValid = await jwt.verify(sessionCookieContent, jwtConfig.tokenSecret);
  if (!isTokenValid) {
    return null;
  }

  const tokenContent = jwt.decode(sessionCookieContent);
  if (
    !tokenContent.payload ||
    !tokenContent.payload.id ||
    !tokenContent.payload.username ||
    !tokenContent.payload.userType
  ) {
    return null;
  }

  return {
    userId: tokenContent.payload.id,
    username: tokenContent.payload.username,
    userType: tokenContent.payload.userType,
  };
}

// export async function getUser(request: Request, jwtConfigStr: string) {
//   const userSession = await getUserSession(request, jwtConfigStr);
//   if (userSession === null) {
//     return null;
//   }

//   // TODO: lookup full user in db/old api here
//   const userFromDb = { id: 1, username: 'Melon' }; // remove this, obv
//   return userFromDb;
// }

// Place in the loader of routes requiring a logged in user
export async function requireUser(request: Request, jwtConfigStr: string) {
  const userSession = await getUserSession(request, jwtConfigStr);
  if (!userSession) {
    throw redirect(`/`);
  }
  return userSession.userId;
}

export async function logout(jwtConfigStr: string) {
  const jwtConfig: JwtConfig = JSON.parse(jwtConfigStr);

  const destroyUserDataHeader = destroyUserDataCookieHeader(jwtConfig);
  const destroySessionCookieHeader = destroyJwtAuthCookieHeader(jwtConfig);

  const headers = new Headers();
  headers.append('Set-Cookie', destroySessionCookieHeader);
  headers.append('Set-Cookie', destroyUserDataHeader);

  return redirect('/', { headers });
}

export async function createUserSession(user: User, jwtConfigStr: string) {
  const jwtConfig: JwtConfig = JSON.parse(jwtConfigStr);

  // This one is for auth - will be verified on the server(s)
  const sessionCookieHeader = await createJwtAuthCookieHeader(
    user.id,
    user.username,
    user.userType,
    jwtConfig
  );

  // This one is to ensure cross-subdomain auth, will not need when everything is Remix.
  // This one is not serialized/anything like that, and not httpOnly, so it can be read by the
  // Vue code in the browser - which ensures a smooth experience since that's not SSR.
  const userDataCookieHeader = createUserDataCookieHeader(user, jwtConfig);

  const headers = new Headers();
  headers.append('Set-Cookie', sessionCookieHeader);
  headers.append('Set-Cookie', userDataCookieHeader);

  return redirect('/', {
    headers,
  });
}

async function createJwtAuthCookieHeader(
  userId: number,
  username: string,
  userType: string,
  jwtConfig: JwtConfig
) {
  const token = await jwt.sign({ id: userId, username, userType }, jwtConfig.tokenSecret);
  // Creating it manually, because the Remix methods transform it for some reason??
  return `${jwtConfig.cookie.name}=${token}; Max-Age=${jwtConfig.cookie.maxAge}; Domain=${
    jwtConfig.cookie.domain
  };${jwtConfig.cookie.secure ? ' Secure;' : ''}${
    jwtConfig.cookie.httpOnly ? ' HttpOnly;' : ''
  }`;
}

function destroyJwtAuthCookieHeader(jwtConfig: JwtConfig): string {
  // Creating it manually, because the Remix methods transform it for some reason??
  return `${jwtConfig.cookie.name}=; Max-Age=0; Domain=${jwtConfig.cookie.domain};${
    jwtConfig.cookie.secure ? ' Secure;' : ''
  }${
    jwtConfig.cookie.httpOnly ? ' HttpOnly;' : ''
  } Expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
}

function createUserDataCookieHeader(userData: any, jwtConfig: JwtConfig) {
  // Creating it manually, because the Remix methods transform it for some reason??
  return `yiffer_userdata=${JSON.stringify(userData)}; Max-Age=${
    jwtConfig.cookie.maxAge
  }; Domain=${jwtConfig.cookie.domain}; ${jwtConfig.cookie.secure ? 'Secure' : ''};`;
}

function destroyUserDataCookieHeader(jwtConfig: JwtConfig) {
  // Creating it manually, because the Remix methods transform it for some reason??
  return `yiffer_userdata=; Max-Age=0; Domain=${jwtConfig.cookie.domain}; ${
    jwtConfig.cookie.secure ? 'Secure' : ''
  }; Expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
}

function cookiesStringToYifferSessionCookie(
  allCookies: string | null,
  cookieName: string
): string | undefined {
  if (!allCookies) {
    return;
  }
  const cookiesSplit = allCookies.split(';').map(cookieStr => cookieStr.trim());
  const yifferSessionCookie = cookiesSplit.find(cookie =>
    cookie.startsWith(`${cookieName}=`)
  );
  if (!yifferSessionCookie) {
    return;
  }
  return yifferSessionCookie.slice(cookieName.length + 1);
}
