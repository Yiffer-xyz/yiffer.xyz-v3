import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { getUserByField } from '~/route-funcs/get-user';
import type { MinimalUser } from '~/types/types';
import { queryDb } from '~/utils/database-facade';
import type { noGetRoute, ResultOrErrorPromise } from '~/utils/request-helpers';
import {
  create400Json,
  createSuccessJson,
  makeDbErrObj,
  processApiError,
} from '~/utils/request-helpers';

export { noGetRoute as loader };

// Search by either id (exact) or username (fuzzy, list)
export async function action(args: ActionFunctionArgs) {
  const body = await args.request.formData();
  const searchQuery = body.get('searchQuery') as string;
  const searchIdQuery = body.get('searchIdQuery') as string;

  // ID search, exact match, returned as array still
  if (searchIdQuery) {
    const userId = parseInt(searchIdQuery);
    if (isNaN(userId)) return create400Json('Invalid user id');

    const userRes = await getUserByField({
      db: args.context.cloudflare.env.DB,
      field: 'id',
      value: userId,
    });

    if (userRes.err) {
      return processApiError('Error in /search-users by id', userRes.err);
    }
    if (userRes.notFound || !userRes.result) {
      return create400Json('User not found');
    }
    const user: MinimalUserWithAllowMessages = {
      allowMessages: !!userRes.result.allowMessages,
      id: userRes.result.id,
      username: userRes.result.username,
      profilePictureToken: userRes.result.profilePictureToken,
    };
    return createSuccessJson([user]);
  }

  // Username search, fuzzy, list
  if (searchQuery.length < 2) {
    return createSuccessJson([]);
  }

  const usersRes = await getUsers(args.context.cloudflare.env.DB, searchQuery);
  if (usersRes.err) {
    return processApiError('Error in /search-users', usersRes.err);
  }
  return createSuccessJson(usersRes.result);
}

type DbMinimalUserWithAllowMessages = MinimalUser & {
  allowMessages: 1 | 0;
};

export type MinimalUserWithAllowMessages = MinimalUser & {
  allowMessages: boolean;
};

export async function getUsers(
  db: D1Database,
  searchQuery: string
): ResultOrErrorPromise<MinimalUserWithAllowMessages[]> {
  const usersQuery =
    'SELECT id, username, profilePictureToken, allowMessages FROM user WHERE username LIKE ? LIMIT 30';
  const usersRes = await queryDb<DbMinimalUserWithAllowMessages[]>(
    db,
    usersQuery,
    [`%${searchQuery}%`],
    'User search'
  );
  if (usersRes.isError || !usersRes.result) {
    return makeDbErrObj(usersRes, 'Error getting users from db', { searchQuery });
  }

  usersRes.result.sort((a, b) => {
    if (a.username.startsWith(searchQuery)) return -1;
    if (b.username.startsWith(searchQuery)) return 1;
    return 0;
  });

  return {
    result: usersRes.result.map(user => ({
      ...user,
      allowMessages: user.allowMessages === 1,
    })),
  };
}
