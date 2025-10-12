import { isUserRestricted } from '~/route-funcs/get-user-restrictions';
import type { UserRestrictionType } from '~/types/types';
import { create400Json, processApiError } from './request-helpers';
import { format } from 'date-fns';
import { isIpBanned } from '~/route-funcs/is-ip-banned';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { authLoader } from './loaders';

// Returns a 400 if user is restricted or IP is banned.
// Also returns processApiError if something fails.
export async function returnIfRestricted(
  args: ActionFunctionArgs | LoaderFunctionArgs,
  sourceApiRoute: string,
  actionType?: UserRestrictionType
) {
  const ip = args.request.headers.get('CF-Connecting-IP');
  const db = args.context.cloudflare.env.DB;
  const user = await authLoader(args);

  if (user && actionType) {
    const isRestrictedRes = await isUserRestricted(db, user.userId, actionType);
    if (isRestrictedRes.err) {
      return processApiError(`Error in ${sourceApiRoute}`, isRestrictedRes.err);
    }
    if (isRestrictedRes.result.isRestricted && isRestrictedRes.result.endDate) {
      return create400Json(
        `${restrictTypeToErrorMessage(actionType)} until ${format(isRestrictedRes.result.endDate, 'PP')}`
      );
    }
  } else {
    if (ip) {
      const isIpBannedRes = await isIpBanned(db, ip);
      if (isIpBannedRes.err) {
        return processApiError(`Error in ${sourceApiRoute}`, isIpBannedRes.err);
      }
      if (isIpBannedRes.result.isBanned) {
        return create400Json('Your IP address is banned');
      }
    }
  }
}

function restrictTypeToErrorMessage(actionType: UserRestrictionType) {
  switch (actionType) {
    case 'contribute':
      return 'You are restricted from making contributions';
    case 'chat':
      return 'You are restricted from sending messages';
    case 'comment':
      return 'You are restricted from commenting';
  }
}
