import type { Route } from './+types/change-username';
import {
  authenticateAndGetHeaders,
  validatePasswordForUserId,
  validateUsername,
} from '~/utils/auth.server';
import { queryDb, queryDbExec } from '~/utils/database-facade';
import { authLoader } from '~/utils/loaders';
import {
  create400Json,
  createAnyErrorCodeJson,
  makeDbErr,
  noGetRoute,
  processApiError,
} from '~/utils/request-helpers';

export { noGetRoute as loader };

export async function action(args: Route.ActionArgs) {
  const user = await authLoader(args);
  if (!user) {
    return create400Json('Not logged in');
  }

  const reqBody = await args.request.formData();
  const { currentPassword: formCurrentPassword, newUsername: formNewUsername } =
    Object.fromEntries(reqBody);

  if (!formCurrentPassword || !formNewUsername) {
    return create400Json('Missing fields');
  }

  const currentPassword = formCurrentPassword.toString().trim();
  const newUsername = formNewUsername.toString().trim();

  const { friendlyErrorMsg } = await validatePasswordForUserId(
    args.context.cloudflare.env.DB,
    user.userId,
    currentPassword
  );

  if (friendlyErrorMsg) {
    return create400Json(friendlyErrorMsg);
  }

  const usernameErr = validateUsername(newUsername);
  if (usernameErr) {
    return create400Json(usernameErr);
  }

  const usernameQuery = 'SELECT * FROM user WHERE username = ? COLLATE NOCASE';

  const usernameRes = await queryDb<any[]>(
    args.context.cloudflare.env.DB,
    usernameQuery,
    [newUsername],
    'Change username check'
  );

  if (usernameRes.isError) {
    return processApiError(
      'Error in /api/change-username',
      makeDbErr(usernameRes, 'Error checking username existence')
    );
  }

  if (usernameRes.result.length) {
    return create400Json('Username already exists');
  }

  const updateQuery = 'UPDATE user SET username = ? WHERE id = ?';
  const updateParams = [newUsername, user.userId];

  const updateRes = await queryDbExec(
    args.context.cloudflare.env.DB,
    updateQuery,
    updateParams
  );

  if (updateRes.isError) {
    return processApiError(
      'Error in /api/change-username',
      makeDbErr(updateRes, 'Error updating username')
    );
  }

  const { err, errorMessage, headers } = await authenticateAndGetHeaders({
    username: newUsername,
    password: currentPassword,
    db: args.context.cloudflare.env.DB,
    jwtConfigStr: args.context.cloudflare.env.JWT_CONFIG_STR,
  });

  if (err) {
    return processApiError('Error authenticating at the end of /change-username', err, {
      newUsername,
      errorMessage,
    });
  }

  if (errorMessage) {
    return createAnyErrorCodeJson(401, errorMessage);
  }

  return Response.json({ success: true, data: null, error: null }, { headers });
}
