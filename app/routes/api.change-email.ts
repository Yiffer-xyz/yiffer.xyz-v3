import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { validatePasswordForUserId } from '~/utils/auth.server';
import { queryDbExec } from '~/utils/database-facade';
import { randomString } from '~/utils/general';
import { authLoader } from '~/utils/loaders';
import {
  create400Json,
  createSuccessJson,
  makeDbErr,
  noGetRoute,
  processApiError,
} from '~/utils/request-helpers';
import { createEmailChangeEmail, sendEmail } from '~/utils/send-email';

export { noGetRoute as loader };

export async function action(args: ActionFunctionArgs) {
  const user = await authLoader(args);
  if (!user) {
    return create400Json('Not logged in');
  }

  const reqBody = await args.request.formData();
  const { currentPassword: formCurrentPassword, newEmail: formNewEmail } =
    Object.fromEntries(reqBody);

  if (!formCurrentPassword || !formNewEmail) {
    return create400Json('Missing fields');
  }

  const currentPassword = formCurrentPassword.toString().trim();
  const newEmail = formNewEmail.toString().trim();

  const { friendlyErrorMsg } = await validatePasswordForUserId(
    args.context.cloudflare.env.DB,
    user.userId,
    currentPassword
  );

  if (friendlyErrorMsg) {
    return create400Json(friendlyErrorMsg);
  }

  if (!newEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return create400Json('Invalid email');
  }

  const emailCode = randomString(30);

  const insertQuery =
    'INSERT INTO emailchangecode (code, userId, newEmail) VALUES (?, ?, ?)';
  const insertParams = [emailCode, user.userId, newEmail];

  const insertRes = await queryDbExec(
    args.context.cloudflare.env.DB,
    insertQuery,
    insertParams,
    'Email change code insert'
  );
  if (insertRes.isError) {
    return processApiError(
      'Error in /api/change-email',
      makeDbErr(insertRes, 'Error inserting email change code', { emailCode, user })
    );
  }

  const err = await sendEmail(
    createEmailChangeEmail(
      emailCode,
      newEmail,
      args.context.cloudflare.env.FRONT_END_URL_BASE
    ),
    args.context.cloudflare.env.POSTMARK_TOKEN
  );
  if (err) {
    return processApiError('Error in /api/change-email', err, { emailCode, newEmail });
  }

  return createSuccessJson();
}
