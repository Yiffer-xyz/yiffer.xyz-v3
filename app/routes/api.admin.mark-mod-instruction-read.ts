import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { queryDbExec } from '~/utils/database-facade';
import { redirectIfNotMod } from '~/utils/loaders';
import type { noGetRoute } from '~/utils/request-helpers';
import {
  create400Json,
  createSuccessJson,
  makeDbErr,
  processApiError,
} from '~/utils/request-helpers';

export { noGetRoute as loader };

export type TagChanges = {
  comicId: number;
  newTagIDs: number[];
  removedTagIDs: number[];
};

export async function action(args: ActionFunctionArgs) {
  const user = await redirectIfNotMod(args);

  const formData = await args.request.formData();
  const instructionId = formData.get('instructionId');
  if (!instructionId?.toString()) {
    return create400Json('Invalid instruction ID');
  }

  const query =
    'INSERT INTO modinstructionsreadreceipt (userId, instructionId) VALUES (?, ?)';
  const params = [user.userId, instructionId];

  const res = await queryDbExec(
    args.context.cloudflare.env.DB,
    query,
    params,
    'Mark mod instruction read'
  );

  if (res.isError) {
    return processApiError(
      'Error in /mark-mod-instruction-read',
      makeDbErr(res, 'Error marking mod instruction read')
    );
  }

  return createSuccessJson();
}
