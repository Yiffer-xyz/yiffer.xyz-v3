import type { Route } from './+types/update-profile-photo';
import { R2_PROFILE_PICTURES_FOLDER, R2_TEMP_FOLDER } from '~/types/constants';
import { queryDb, queryDbExec } from '~/utils/database-facade';
import { redirectIfNotLoggedIn } from '~/utils/loaders';
import { renameR2File } from '~/utils/r2Utils';
import {
  create400Json,
  createSuccessJson,
  makeDbErr,
  noGetRoute,
  processApiError,
  type ApiError,
} from '~/utils/request-helpers';
import { generateToken, isValidToken } from '~/utils/string-utils';

export { noGetRoute as loader };

export async function action(args: Route.ActionArgs) {
  const user = await redirectIfNotLoggedIn(args);
  const formDataBody = await args.request.formData();
  const formDataToken = formDataBody.get('tempToken');
  if (!formDataToken) return create400Json('Missing tempToken');
  const tempToken = formDataToken.toString();
  if (!isValidToken(tempToken)) return create400Json('Invalid tempToken');

  // generate a new one for security reasons
  const newToken = generateToken();

  const err = await updateProfilePhoto(
    args.context.cloudflare.env.DB,
    args.context.cloudflare.env.COMICS_BUCKET,
    args.context.cloudflare.env.IS_LOCAL_DEV === 'true',
    args.context.cloudflare.env.IMAGES_SERVER_URL,
    user.userId,
    tempToken,
    newToken
  );
  if (err) {
    return processApiError('Error in /update-profile-photo', err, {
      newToken,
      tempToken,
      userId: user.userId,
    });
  }

  return createSuccessJson();
}

export async function updateProfilePhoto(
  db: D1Database,
  r2: R2Bucket,
  isLocalDev: boolean,
  imagesServerUrl: string,
  userId: number,
  tempToken: string,
  newToken: string
): Promise<ApiError | undefined> {
  const getUserQuery = `SELECT profilePictureToken FROM user WHERE id=?`;

  const userDbRes = await queryDb<{ profilePictureToken: string }[]>(
    db,
    getUserQuery,
    [userId],
    'Get user profile photo token'
  );
  if (userDbRes.isError) {
    return makeDbErr(userDbRes, 'Error getting user profile photo token');
  }
  const existingToken =
    userDbRes.result.length > 0 ? userDbRes.result[0].profilePictureToken : null;

  if (existingToken) {
    try {
      await r2.delete([
        `${R2_PROFILE_PICTURES_FOLDER}/${existingToken}.webp`,
        `${R2_PROFILE_PICTURES_FOLDER}/${existingToken}.jpg`,
      ]);
    } catch (err) {
      return {
        logMessage: 'Error deleting existing profile photo',
        context: { r2Error: err },
      };
    }

    try {
      await renameR2File({
        r2,
        imagesServerUrl,
        isLocalDev,
        oldKey: `${R2_TEMP_FOLDER}/${tempToken}.webp`,
        newKey: `${R2_PROFILE_PICTURES_FOLDER}/${newToken}.webp`,
      });
      await renameR2File({
        r2,
        imagesServerUrl,
        isLocalDev,
        oldKey: `${R2_TEMP_FOLDER}/${tempToken}.jpg`,
        newKey: `${R2_PROFILE_PICTURES_FOLDER}/${newToken}.jpg`,
      });
    } catch (err) {
      return {
        logMessage: 'Error renaming profile photo',
        context: { r2Error: err },
      };
    }
  }

  const updateUserQuery = 'UPDATE user SET profilePictureToken=? WHERE id=?';
  const updateUserParams = [newToken, userId];

  const updateUserDbRes = await queryDbExec(
    db,
    updateUserQuery,
    updateUserParams,
    'Set user profile photo token'
  );
  if (updateUserDbRes.isError) {
    return makeDbErr(updateUserDbRes, 'Error setting user profile photo token');
  }
}
