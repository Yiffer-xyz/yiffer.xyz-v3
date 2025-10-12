import type { Route } from './+types/get-messages-paginated';
import { getChat } from '~/route-funcs/get-chat';
import { isModOrAdmin } from '~/types/types';
import { redirectIfNotLoggedIn } from '~/utils/loaders';
import {
  createSuccessJson,
  processApiError,
  noGetRoute,
  create400Json,
} from '~/utils/request-helpers';

export { noGetRoute as loader };

export async function action(args: Route.ActionArgs) {
  const user = await redirectIfNotLoggedIn(args);

  const formData = await args.request.formData();
  const chatToken = formData.get('chatToken');
  const page = Number(formData.get('page')) ?? 1;

  if (!chatToken || !Number.isInteger(page)) {
    return create400Json('Missing chatToken or page');
  }

  const messagesRes = await getChat({
    db: args.context.cloudflare.env.DB,
    getBlockedStatus: false,
    page,
    isModOrAdmin: isModOrAdmin(user),
    chatToken: chatToken as string,
    markReadIfAppropriate: false,
    userId: user.userId,
  });

  if (messagesRes.err) {
    return processApiError(
      'Error getting messages paginated in /api/get-messages-paginated',
      messagesRes.err,
      { chatToken, page, userId: user.userId }
    );
  }

  return createSuccessJson({
    messages: messagesRes.result.messages,
    hasNextPage: messagesRes.result.hasNextPage,
  });
}
