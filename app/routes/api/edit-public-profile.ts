import type { Route } from './+types/edit-public-profile';
import { isModOrAdmin, type PublicUser, type UserSocialAccount } from '~/types/types';
import type { QueryWithParams } from '~/utils/database-facade';
import { queryDb, queryDbExec, queryDbMultiple } from '~/utils/database-facade';
import { redirectIfNotLoggedIn } from '~/utils/loaders';
import { type ApiError, noGetRoute } from '~/utils/request-helpers';
import {
  create400Json,
  createSuccessJson,
  makeDbErr,
  processApiError,
} from '~/utils/request-helpers';
import { validatePublicUser } from '~/utils/user-utils';

export { noGetRoute as loader };

export async function action(args: Route.ActionArgs) {
  const user = await redirectIfNotLoggedIn(args);
  const formData = await args.request.formData();
  const body = JSON.parse(formData.get('body') as string) as PublicUser;

  const { error } = validatePublicUser(body);
  if (error) {
    return create400Json(error);
  }

  let idToEdit = user.userId;

  if (body.id !== user.userId) {
    if (!isModOrAdmin(user)) {
      return create400Json('You are not allowed to edit this profile');
    }
    idToEdit = body.id;
  }

  const err = await editPublicProfile(args.context.cloudflare.env.DB, body, idToEdit);
  if (err) {
    return processApiError('Error in /edit-public-profile', err, {
      body,
      userId: idToEdit,
    });
  }

  return createSuccessJson();
}

export async function editPublicProfile(
  db: D1Database,
  user: PublicUser,
  userId: number
): Promise<ApiError | undefined> {
  const query = `UPDATE user SET bio = ?, nationality = ? WHERE id = ?`;
  const params = [user.bio, user.nationality, userId];
  const dbRes = await queryDbExec(db, query, params, 'Edit public profile');

  if (dbRes.isError) return makeDbErr(dbRes, 'Error editing public profile');

  const socialsQuery = 'SELECT * from usersocialaccount where userId = ?';
  const socialsParams = [userId];
  const socialsRes = await queryDb<UserSocialAccount[]>(
    db,
    socialsQuery,
    socialsParams,
    'User socials'
  );

  if (socialsRes.isError) return makeDbErr(socialsRes, 'Error getting user socials');

  const newSocials = user.socialLinks.filter(s => !s.id);
  const deletedSocials = socialsRes.result.filter(
    s => !user.socialLinks.find(s2 => s2.id === s.id)
  );
  const updatedSocials = user.socialLinks.filter(s => {
    const existing = socialsRes.result.find(s2 => s2.id === s.id);
    if (!existing) return false;
    return existing.username !== s.username || existing.platform !== s.platform;
  });

  if (newSocials.length > 0) {
    const query = `INSERT INTO usersocialaccount (username, platform, userId) VALUES ${newSocials.map(() => '(?, ?, ?)').join(',')}`;
    const params = newSocials.flatMap(s => [s.username, s.platform, userId]);
    const dbRes = await queryDbExec(db, query, params, 'Add new user socials');
    if (dbRes.isError) return makeDbErr(dbRes, 'Error adding new user socials');
  }
  if (deletedSocials.length > 0) {
    const query = `DELETE FROM usersocialaccount WHERE id IN (${deletedSocials.map(() => '?').join(',')})`;
    const params = deletedSocials.map(s => s.id);
    const dbRes = await queryDbExec(db, query, params, 'Delete user socials');
    if (dbRes.isError) return makeDbErr(dbRes, 'Error deleting user socials');
  }
  if (updatedSocials.length > 0) {
    const queriesWithParams: QueryWithParams[] = [];
    for (const s of updatedSocials) {
      const query = `UPDATE usersocialaccount SET username = ?, platform = ? WHERE id = ?`;
      const params = [s.username, s.platform, s.id];
      queriesWithParams.push({ query, params, queryName: 'Update user socials' });
    }
    const dbRes = await queryDbMultiple(db, queriesWithParams);
    if (dbRes.isError) return makeDbErr(dbRes, 'Error updating user socials');
  }

  return;
}
