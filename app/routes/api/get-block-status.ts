import type { Route } from './+types/get-block-status';
import { getUserBlockStatus } from '~/route-funcs/get-user-block-status';
import { redirectIfNotLoggedIn } from '~/utils/loaders';
import {
  create400Json,
  createSuccessJson,
  processApiError,
} from '~/utils/request-helpers';
import { validateFormDataNumber } from '~/utils/string-utils';

export async function action(args: Route.ActionArgs) {
  const user = await redirectIfNotLoggedIn(args);

  const formData = await args.request.formData();
  const otherUserId = validateFormDataNumber(formData, 'otherUserId');

  if (!otherUserId) {
    return create400Json('Invalid otherUserId');
  }

  const blockRes = await getUserBlockStatus(
    args.context.cloudflare.env.DB,
    user.userId,
    otherUserId
  );

  if (blockRes.err) {
    return processApiError('Error in /api/get-block-status', blockRes.err, {
      userId: user.userId,
      otherUserId,
    });
  }

  return createSuccessJson(blockRes.result);
}
