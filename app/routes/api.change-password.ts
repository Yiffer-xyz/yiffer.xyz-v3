import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { changePassword } from '~/utils/auth.server';
import { authLoader } from '~/utils/loaders';
import { create400Json, createSuccessJson, noGetRoute } from '~/utils/request-helpers';

export { noGetRoute as loader };

export async function action(args: ActionFunctionArgs) {
  const user = await authLoader(args);
  if (!user) {
    return create400Json('Not logged in');
  }

  const reqBody = await args.request.formData();
  const {
    currentPassword: formCurrentPassword,
    newPassword: formPassword,
    newPassword2: formPassword2,
  } = Object.fromEntries(reqBody);

  if (!formCurrentPassword || !formPassword || !formPassword2) {
    return create400Json('Missing fields');
  }

  const currentPassword = formCurrentPassword.toString().trim();
  const password = formPassword.toString().trim();
  const password2 = formPassword2.toString().trim();

  const validationErr = getSignupValidationError(currentPassword, password, password2);
  if (validationErr) {
    return create400Json(validationErr);
  }

  const { friendlyErrorMsg } = await changePassword(
    args.context.cloudflare.env.DB,
    user?.userId,
    currentPassword,
    password
  );

  if (friendlyErrorMsg) {
    return create400Json(friendlyErrorMsg);
  }

  return createSuccessJson();
}

function getSignupValidationError(
  currentPassword: string,
  password: string,
  password2: string
): string | undefined {
  if (!currentPassword || !password || !password2) {
    return 'Missing password';
  }
  if (password !== password2) {
    return 'Passwords do not match';
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters';
  }

  return;
}
