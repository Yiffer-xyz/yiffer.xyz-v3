import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { getUserBlockStatus } from '~/route-funcs/get-user-block-status';
import { redirectIfNotLoggedIn } from '~/utils/loaders';
import {
  create400Json,
  createSuccessJson,
  processApiError,
} from '~/utils/request-helpers';

export async function action(args: ActionFunctionArgs) {
  const user = await redirectIfNotLoggedIn(args);

  const formData = await args.request.formData();
  const otherUserId = Number(formData.get('otherUserId'));

  if (Number.isNaN(otherUserId)) {
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
