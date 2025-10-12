import type { Route } from './+types/restrict-user';
import type { UserRestrictionType } from '~/types/types';
import { queryDbExec } from '~/utils/database-facade';
import { redirectIfNotMod } from '~/utils/loaders';
import type { ApiError } from '~/utils/request-helpers';
import {
  create400Json,
  createSuccessJson,
  makeDbErr,
  processApiError,
} from '~/utils/request-helpers';
import { validateFormDataNumber } from '~/utils/string-utils';

export async function action(args: Route.ActionArgs) {
  await redirectIfNotMod(args);

  const formData = await args.request.formData();
  const formRestrictionType = formData.get('restrictionType');
  const formDurationDays = formData.get('durationDays');
  const formUserId = formData.get('userId');

  if (!formRestrictionType || !formDurationDays || !formUserId) {
    return create400Json('Invalid form data');
  }

  const restrictionType = formRestrictionType as UserRestrictionType;
  const durationDays = validateFormDataNumber(formData, 'durationDays');
  const userId = validateFormDataNumber(formData, 'userId');

  if (!durationDays || !userId) {
    return create400Json('Invalid duration days or user ID');
  }

  const err = await restrictUser(
    args.context.cloudflare.env.DB,
    userId,
    restrictionType,
    durationDays
  );

  if (err) {
    return processApiError('Error in /admin/restrict-user', err, {
      userId: userId,
      restrictionType,
      durationDays,
    });
  }

  return createSuccessJson();
}

async function restrictUser(
  db: D1Database,
  userId: number,
  restrictionType: UserRestrictionType,
  durationDays: number
): Promise<ApiError | undefined> {
  const query = `INSERT INTO userrestriction (userId, restrictionType, startDate, endDate)
    VALUES (?, ?, datetime('now'), datetime('now', '+${durationDays} days'))`;
  const result = await queryDbExec(db, query, [userId, restrictionType], 'Restrict user');

  if (result.isError) {
    return makeDbErr(result, 'Error restricting user', {
      userId,
      restrictionType,
      durationDays,
    });
  }
}
