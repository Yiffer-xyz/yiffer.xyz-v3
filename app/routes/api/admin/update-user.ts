import type { Route } from './+types/update-user';
import type { UserType } from '~/types/types';
import { parseFormJson } from '~/utils/formdata-parser';
import { updateUser } from '~/route-funcs/update-user';
import {
  create400Json,
  createSuccessJson,
  processApiError,
} from '~/utils/request-helpers';

export type UpdateUserBody = {
  userId: number;
  userType?: UserType;
  isBanned?: boolean;
  banReason?: string;
  modNotes?: string;
};

export async function action(args: Route.ActionArgs) {
  const { fields, isUnauthorized, user } = await parseFormJson<UpdateUserBody>(
    args,
    'mod'
  );

  if (isUnauthorized || !user) return new Response('Unauthorized', { status: 401 });

  const { isBanned, banReason, userType } = fields;

  if (isBanned && !banReason) {
    return create400Json('Cannot ban a user without a reason');
  }

  const updatedUserType: UserType = userType?.toString() as UserType;

  if (updatedUserType === 'admin' && user?.userType !== 'admin') {
    return create400Json('You are not authorized to make this change');
  }

  const err = await updateUser(args.context.cloudflare.env.DB, fields.userId, {
    userType: updatedUserType,
    isBanned: fields.isBanned === undefined ? undefined : fields.isBanned ? 1 : 0,
    banReason: fields.banReason,
    modNotes: fields.modNotes,
  });

  if (err) {
    return processApiError('Error in /update-user', err, {
      ...fields,
    });
  }

  return createSuccessJson();
}
