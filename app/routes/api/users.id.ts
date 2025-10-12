import type { Route } from './+types/users.id';
import { getUserByField } from '~/route-funcs/get-user';
import {
  create400Json,
  createSuccessJson,
  processApiError,
} from '~/utils/request-helpers';
import { fullUserToPublicUser } from '~/utils/user-utils';

export async function loader(args: Route.LoaderArgs) {
  const userId = parseInt(args.params.id);
  if (isNaN(userId)) {
    return create400Json('Invalid user id');
  }

  const userRes = await getUserByField({
    db: args.context.cloudflare.env.DB,
    field: 'id',
    value: userId,
    includeExtraFields: false,
  });

  if (userRes.err) {
    return processApiError('Error in /get-user', userRes.err);
  }
  if (userRes.notFound) {
    return create400Json('User not found');
  }

  return createSuccessJson(fullUserToPublicUser(userRes.result));
}
