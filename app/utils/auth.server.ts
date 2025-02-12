import { redirect } from '@remix-run/cloudflare';
import jwt from '@tsndr/cloudflare-worker-jwt';
import type { JwtConfig, SimpleUser, UserSession } from '~/types/types';
import type { QueryWithParams } from './database-facade';
import { queryDb, queryDbExec, queryDbMultiple } from './database-facade';
import type { ApiError, ResultOrErrorPromise } from './request-helpers';
import { logApiError, makeDbErr, makeDbErrObj, wrapApiError } from './request-helpers';
import { createWelcomeEmail, sendEmail } from './send-email';
import bcrypt from 'bcryptjs';
import updateUserLastActionTime from '~/route-funcs/update-user-last-action';
const { hash, compare } = bcrypt;

type AuthResponse = {
  err?: ApiError;
  redirect?: Response;
  errorMessage?: string;
};

type UserWithPwAndBan = SimpleUser & {
  password: string;
  isBanned: 0 | 1;
  banReason: string | null;
};

type LoginArgs = {
  username: string;
  password: string;
  db: D1Database;
  jwtConfigStr: string;
  redirectTo?: string;
};

export async function login({
  username,
  password,
  db,
  jwtConfigStr,
  redirectTo,
}: LoginArgs): Promise<AuthResponse> {
  const { err, errorMessage, user } = await authenticate(db, username, password);
  if (err) {
    return { err: wrapApiError(err, 'Error in login func', { username, password }) };
  }
  if (errorMessage) {
    return { errorMessage };
  }

  const headers = await createUserSessionHeaders(user as SimpleUser, jwtConfigStr);
  return { redirect: redirect(redirectTo || '/', { headers }) };
}

type SignupArgs = {
  username: string;
  email: string;
  password: string;
  db: D1Database;
  jwtConfigStr: string;
  postmarkToken: string;
  redirectTo?: string;
};

export async function signup({
  username,
  email,
  password,
  db,
  jwtConfigStr,
  postmarkToken,
  redirectTo,
}: SignupArgs): Promise<AuthResponse> {
  const usernameQuery = 'SELECT * FROM user WHERE username = ? COLLATE NOCASE';
  const emailQuery = 'SELECT * FROM user WHERE email = ? COLLATE NOCASE';

  const dbStatements: QueryWithParams[] = [
    {
      query: usernameQuery,
      params: [username],
      queryName: 'Signup username check',
    },
    {
      query: emailQuery,
      params: [email],
      queryName: 'Signup email check',
    },
  ];

  const dbRes = await queryDbMultiple<[any[], any[]]>(db, dbStatements);
  if (dbRes.isError) {
    return makeDbErrObj(dbRes, 'Error checking username+email in signup');
  }

  if (dbRes.result[0].length) {
    return { errorMessage: 'Username already exists' };
  }
  if (dbRes.result[1].length) {
    return { errorMessage: 'Email already exists' };
  }

  const hashedPassword = await hash(password, 8);
  const insertQuery = 'INSERT INTO user (username, password, email) VALUES (?, ?, ?)';
  const insertResult = await queryDbExec(
    db,
    insertQuery,
    [username, hashedPassword, email],
    'Signup'
  );
  if (insertResult.isError) {
    return makeDbErrObj(insertResult, 'Error inserting user');
  }
  const newUserResult = await queryDb<{ id: number }[]>(
    db,
    'SELECT id FROM user WHERE username = ? COLLATE NOCASE LIMIT 1',
    [username],
    'New user ID'
  );
  if (newUserResult.isError) {
    return makeDbErrObj(newUserResult, 'Error fetching new user after creation');
  }

  const user: SimpleUser = {
    id: newUserResult.result[0].id,
    username,
    email,
    userType: 'normal',
    patreonDollars: null,
  };

  let err: any;
  try {
    err = await sendEmail(createWelcomeEmail(username, email), postmarkToken);
  } catch (e) {
    err = e;
  }
  if (err) {
    logApiError('Error sending welcome email in signup', err, { username, email });
  }

  const headers = await createUserSessionHeaders(user, jwtConfigStr);
  return { redirect: redirect(redirectTo || '/', { headers }) };
}

export async function changePassword(
  db: D1Database,
  userId: number,
  oldPassword: string,
  newPassword: string
): Promise<{ friendlyErrorMsg: string | undefined }> {
  const { friendlyErrorMsg } = await validatePasswordForUserId(db, userId, oldPassword);
  if (friendlyErrorMsg) {
    return { friendlyErrorMsg };
  }

  const hashedPassword = await hash(newPassword, 8);
  const updateQuery = 'UPDATE user SET password = ? WHERE id = ?';
  const updateQueryRes = await queryDbExec(
    db,
    updateQuery,
    [hashedPassword, userId],
    'Change password'
  );
  if (updateQueryRes.isError) {
    logApiError('Error updating password', makeDbErr(updateQueryRes), { userId });
    return { friendlyErrorMsg: 'Error updating password' };
  }

  return { friendlyErrorMsg: undefined };
}

export async function validatePasswordForUserId(
  db: D1Database,
  userId: number,
  password: string
): Promise<{ friendlyErrorMsg: string | undefined }> {
  const userQuery = 'SELECT password FROM user WHERE id = ?';
  const userQueryRes = await queryDb<{ password: string }[]>(
    db,
    userQuery,
    [userId],
    'User for password change'
  );
  if (userQueryRes.isError) {
    logApiError('Error fetching user for pw change', makeDbErr(userQueryRes), { userId });
    return { friendlyErrorMsg: 'Error fetching user for password change' };
  }
  if (!userQueryRes.result?.length) {
    return { friendlyErrorMsg: 'User not found' };
  }

  const userPassword = userQueryRes.result[0];
  const isPasswordValid = await compare(password, userPassword.password);
  if (!isPasswordValid) {
    return { friendlyErrorMsg: 'Old password is incorrect' };
  }

  return { friendlyErrorMsg: undefined };
}

async function authenticate(
  db: D1Database,
  usernameOrEmail: string,
  password: string
): Promise<{ err?: ApiError; errorMessage?: string; user?: SimpleUser }> {
  const query = `SELECT id, username, email, userType, password, isBanned, banReason, patreonDollars
     FROM user WHERE username = ? COLLATE NOCASE OR email = ? COLLATE NOCASE`;
  const queryParams = [usernameOrEmail, usernameOrEmail];

  const fetchDbRes = await queryDb<UserWithPwAndBan[]>(
    db,
    query,
    queryParams,
    'User, authentication'
  );
  if (fetchDbRes.isError) {
    return makeDbErrObj(fetchDbRes, 'Login error fetching username/email');
  }
  if (!fetchDbRes.result?.length) {
    return { errorMessage: 'Username does not exist or wrong password' };
  }

  const user = fetchDbRes.result[0];
  const isPasswordValid = await compare(password, user.password);
  if (!isPasswordValid) {
    return { errorMessage: 'Username does not exist or wrong password' };
  }

  if (user.isBanned === 1) {
    return {
      errorMessage: `You have been banned. Reason: ${user.banReason ?? 'unspecified'}`,
    };
  }

  updateUserLastActionTime({ db, userId: user.id });

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      userType: user.userType,
      patreonDollars: user.patreonDollars ?? null,
    },
  };
}

// To get the user data - {userId, username, userType, patreonDollars}
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
    email: tokenContent.payload.email ?? null,
    userType: tokenContent.payload.userType,
    patreonDollars: tokenContent.payload.patreonDollars ?? null,
  };
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

export async function createUserSessionHeaders(user: SimpleUser, jwtConfigStr: string) {
  const jwtConfig: JwtConfig = JSON.parse(jwtConfigStr);

  // This one is for auth - will be verified on the server(s)
  const sessionCookieHeader = await createJwtAuthCookieHeader(
    user.id,
    user.username,
    user.userType,
    user.patreonDollars ?? null,
    user.email ?? null,
    jwtConfig
  );

  // This one is to ensure cross-subdomain auth, will not need when everything is Remix.
  // This one is not serialized/anything like that, and not httpOnly, so it can be read by the
  // Vue code in the browser - which ensures a smooth experience since that's not SSR.
  const userDataCookieHeader = createUserDataCookieHeader(user, jwtConfig);

  const headers = new Headers();
  headers.append('Set-Cookie', sessionCookieHeader);
  headers.append('Set-Cookie', userDataCookieHeader);

  return headers;
}

async function createJwtAuthCookieHeader(
  userId: number,
  username: string,
  userType: string,
  patreonDollars: number | null,
  email: string | null,
  jwtConfig: JwtConfig
) {
  const token = await jwt.sign(
    { id: userId, username, userType, patreonDollars, email },
    jwtConfig.tokenSecret
  );
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

export async function logIPAndVerifyNoSignupSpam(
  db: D1Database,
  email: string,
  ip?: string | null
): ResultOrErrorPromise<{ isSpam: boolean }> {
  return { result: { isSpam: false } };

  // if (!ip) {
  //   return { result: { isSpam: false } };
  // }

  // const getRecentActionsQuery =
  //   'SELECT * FROM spammableaction WHERE ip = ? AND actionType = ?';
  // const getRecentActionsQueryParams = [ip, 'signup'];
  // const getRecentActionsRes = await queryDb<SpammableAction[]>(
  //   db,
  //   getRecentActionsQuery,
  //   getRecentActionsQueryParams,
  //   'Get spammable actions'
  // );

  // if (getRecentActionsRes.isError) {
  //   return makeDbErrObj(getRecentActionsRes, 'Error getting spammable actions');
  // }

  // if (getRecentActionsRes.result.length > 0) {
  //   const vaguelySimilarEmails = [email];
  //   for (const recentUser of getRecentActionsRes.result) {
  //     if (!recentUser.email) continue;
  //     const emailDistance = stringDistance(recentUser.email, email);
  //     if (emailDistance < 8) {
  //       vaguelySimilarEmails.push(recentUser.email);
  //     }
  //   }

  //   const allSimilarEmails = getSimilarEmails(vaguelySimilarEmails);
  //   if (allSimilarEmails.length >= 0) {
  //     return { result: { isSpam: true } };
  //   }
  // }

  // const insertQuery =
  //   'INSERT INTO spammableaction (ip, email, actionType) VALUES (?, ?, ?)';
  // const insertQueryParams = [ip, email, 'signup'];
  // const insertQueryRes = await queryDbExec(
  //   db,
  //   insertQuery,
  //   insertQueryParams,
  //   'Log spammable action'
  // );

  // if (insertQueryRes.isError) {
  //   return makeDbErrObj(insertQueryRes, 'Error logging spammable action');
  // }

  // return { result: { isSpam: false } };
}

// function getSimilarEmails(emailList: string[]) {
//   const similarEmails = new Set<string>();

//   for (let i = 0; i < emailList.length; i++) {
//     for (let j = 0; j < emailList.length; j++) {
//       if (i === j) {
//         continue;
//       }
//       if (stringDistance(emailList[i], emailList[j]) <= 3) {
//         similarEmails.add(emailList[i]);
//         similarEmails.add(emailList[j]);
//       }
//     }
//   }

//   return [...similarEmails];
// }

export function validateUsername(username: string): string | undefined {
  if (username.length < 2 || username.length > 25) {
    return 'Username must be between 2 and 25 characters';
  }
  if (!username.match(/^[a-zA-Z0-9_-]+$/)) {
    return 'Username can contain only letters, numbers, dashes, and underscores.';
  }
  return undefined;
}
