import {UserType} from '~/types/types'
import {ActionFunctionArgs} from '@remix-run/cloudflare'
import {parseFormJson} from '~/utils/formdata-parser'
import {updateUser} from '~/route-funcs/update-user'
import {create400Json, createSuccessJson, processApiError} from '~/utils/request-helpers'

export type UpdateUserBody = {
  userId: number;
  userType?: UserType;
  isBanned?: boolean;
  banReason?: string;
  modNotes?: string;
};

export async function action(args: ActionFunctionArgs) {
  const { fields, isUnauthorized } = await parseFormJson<UpdateUserBody>(args, 'mod');

  if (isUnauthorized) return new Response('Unauthorized', { status: 401 });

  const { isBanned, banReason, userType } = fields;

  if (isBanned && !banReason) {
    return create400Json('Cannot ban a user without a reason');
  }

  let updatedUserType: string | undefined = fields.userType;

  if (updatedUserType && userType === 'user') {
    updatedUserType = 'normal';
  }


  const err = await updateUser(
    args.context.DB,
    fields.userId,
    {
      userType: updatedUserType,
      isBanned: fields.isBanned ? 1 : 0,
      banReason: fields.banReason,
      modNotes: fields.modNotes,
    }
  );

  if (err) {
    return processApiError('Error in /update-user', err, {
      ...fields,
    });
  }

  return createSuccessJson();
}