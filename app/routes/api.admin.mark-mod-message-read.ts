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
  const messageId = formData.get('messageId');
  if (!messageId || Number.isNaN(Number(messageId))) {
    return create400Json('Invalid message ID');
  }

  const query =
    'INSERT OR IGNORE INTO modmessagereadreceipt (userId, messageId) VALUES (?, ?)';
  const params = [user.userId, Number(messageId)];

  const res = await queryDbExec(
    args.context.cloudflare.env.DB,
    query,
    params,
    'Mark mod message read'
  );

  if (res.isError) {
    return processApiError(
      'Error in /mark-mod-message-read',
      makeDbErr(res, 'Error marking mod message read')
    );
  }

  return createSuccessJson();
}
