import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { R2_PROFILE_PICTURES_FOLDER } from '~/types/constants';
import { isModOrAdmin } from '~/types/types';
import { queryDb, queryDbExec } from '~/utils/database-facade';
import { redirectIfNotLoggedIn } from '~/utils/loaders';
import {
  create400Json,
  createSuccessJson,
  makeDbErr,
  noGetRoute,
  processApiError,
  type ApiError,
} from '~/utils/request-helpers';
import { validateFormDataNumber } from '~/utils/string-utils';

export { noGetRoute as loader };

export async function action(args: ActionFunctionArgs) {
  const user = await redirectIfNotLoggedIn(args);
  const formDataBody = await args.request.formData();
  const userId = validateFormDataNumber(formDataBody, 'userId');

  let userIdToEdit = user.userId;

  if (userId) {
    if (user.userId !== userId && !isModOrAdmin(user)) {
      return create400Json('You are not allowed to edit this profile');
    }
    userIdToEdit = userId;
  }

  const err = await removeProfilePhoto(
    args.context.cloudflare.env.DB,
    args.context.cloudflare.env.COMICS_BUCKET,
    userIdToEdit
  );
  if (err) {
    return processApiError('Error in /remove-profile-photo', err, {
      userIdToEdit,
    });
  }

  return createSuccessJson();
}

export async function removeProfilePhoto(
  db: D1Database,
  r2: R2Bucket,
  userId: number
): Promise<ApiError | undefined> {
  const getUserQuery = `SELECT profilePictureToken FROM user WHERE id = ?`;
  const userDbRes = await queryDb<{ profilePictureToken: string }[]>(db, getUserQuery, [
    userId,
  ]);
  if (userDbRes.isError) {
    return makeDbErr(userDbRes, 'Error getting user profile photo token');
  }
  const existingToken =
    userDbRes.result.length > 0 ? userDbRes.result[0].profilePictureToken : null;

  if (!existingToken) {
    return;
  }

  const updateUserQuery = `UPDATE user SET profilePictureToken = NULL WHERE id = ?`;

  const updateUserDbRes = await queryDbExec(
    db,
    updateUserQuery,
    [userId],
    'Remove user profile photo'
  );
  if (updateUserDbRes.isError) {
    return makeDbErr(updateUserDbRes, 'Error removing user profile photo');
  }

  r2.delete([
    `${R2_PROFILE_PICTURES_FOLDER}/${existingToken}.webp`,
    `${R2_PROFILE_PICTURES_FOLDER}/${existingToken}.jpg`,
  ]);
}
