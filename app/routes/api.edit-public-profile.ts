import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import type { PublicUser } from '~/types/types';
import { queryDbExec } from '~/utils/database-facade';
import { redirectIfNotLoggedIn } from '~/utils/loaders';
import type { ApiError, noGetRoute } from '~/utils/request-helpers';
import {
  create400Json,
  createSuccessJson,
  makeDbErr,
  processApiError,
} from '~/utils/request-helpers';
import { validatePublicUser } from '~/utils/user-utils';

export { noGetRoute as loader };

export async function action(args: ActionFunctionArgs) {
  const user = await redirectIfNotLoggedIn(args);
  const formData = await args.request.formData();
  const body = JSON.parse(formData.get('body') as string) as PublicUser;

  const { error } = validatePublicUser(body);
  if (error) {
    return create400Json(error);
  }

  const err = await editPublicProfile(args.context.cloudflare.env.DB, body, user.userId);
  if (err) {
    return processApiError('Error in /edit-public-profile', err, {
      body,
      userId: user.userId,
    });
  }

  return createSuccessJson();
}

export async function editPublicProfile(
  db: D1Database,
  user: PublicUser,
  userId: number
): Promise<ApiError | undefined> {
  const linksConcat = user.publicProfileLinks.length
    ? user.publicProfileLinks.filter(Boolean).join(',')
    : null;

  const query = `UPDATE user SET bio = ?, nationality = ?, publicProfileLinks = ? WHERE id = ?`;
  const params = [user.bio, user.nationality, linksConcat, userId];
  const dbRes = await queryDbExec(db, query, params, 'Edit public profile');

  if (dbRes.isError) return makeDbErr(dbRes, 'Error editing public profile');

  return;
}
