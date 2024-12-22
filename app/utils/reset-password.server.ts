import { getUserByEmail } from '~/route-funcs/get-user';
import { type ApiError, wrapApiError, makeDbErr, makeDbErrObj } from './request-helpers';
import { randomString } from './general';
import { queryDb, queryDbExec } from './database-facade';
import { createPasswordResetEmail, sendEmail } from './send-email';
import bcrypt from 'bcryptjs';
const { hash } = bcrypt;

export async function resetPassword(
  db: D1Database,
  postmarkToken: string,
  frontEndUrlBase: string,
  email: string
): Promise<ApiError | undefined> {
  const userRes = await getUserByEmail(db, email);

  if (userRes.err) {
    return wrapApiError(userRes.err, 'Error getting user in resetPassword', { email });
  }

  if (userRes.notFound) return;

  const resetToken = randomString(30);
  const insertQuery = 'INSERT INTO resettoken (token, userId) VALUES (?, ?)';
  const insertParams = [resetToken, userRes.result.id];

  const insertRes = await queryDbExec(
    db,
    insertQuery,
    insertParams,
    'Reset token insert'
  );
  if (insertRes.isError) {
    return makeDbErr(insertRes, 'Error inserting reset token', { email });
  }

  const err = await sendEmail(
    createPasswordResetEmail(resetToken, email, frontEndUrlBase),
    postmarkToken
  );
  if (err) {
    return wrapApiError(err, 'Error in resetPassword', { email });
  }
}

export async function resetPasswordByLink(
  db: D1Database,
  token: string,
  newPassword: string
): Promise<{
  err?: ApiError;
  errorMessage?: string;
}> {
  if (newPassword.length < 6) {
    return { errorMessage: 'Password must be at least 6 characters.' };
  }

  const tokenQuery = 'SELECT userId FROM resettoken WHERE token = ?';
  const tokenParams = [token];

  const tokenRes = await queryDb<{ userId: number }[]>(
    db,
    tokenQuery,
    tokenParams,
    'Password reset token'
  );
  if (tokenRes.isError) {
    return makeDbErrObj(tokenRes, 'Error fetching reset token in resetPasswordByLink', {
      token,
    });
  }

  if (tokenRes.result.length === 0) {
    return { errorMessage: 'Invalid token' };
  }

  const deleteQuery = 'DELETE FROM resettoken WHERE token = ?';
  const deleteParams = [token];

  const deleteRes = await queryDbExec(
    db,
    deleteQuery,
    deleteParams,
    'Reset token delete'
  );
  if (deleteRes.isError) {
    return makeDbErrObj(deleteRes, 'Error deleting reset token', { token });
  }
  const newPasswordHashed = await hash(newPassword, 8);

  const updateQuery = 'UPDATE user SET password = ? WHERE id = ?';
  const updateParams = [newPasswordHashed, tokenRes.result[0].userId];

  const updateRes = await queryDbExec(db, updateQuery, updateParams, 'Password update');
  if (updateRes.isError) {
    return makeDbErrObj(updateRes, 'Error updating password in resetPasswordByLink', {
      token,
    });
  }

  return {};
}
