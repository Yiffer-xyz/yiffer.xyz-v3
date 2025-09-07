import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { redirect, useLoaderData } from '@remix-run/react';
import { createChat } from '~/route-funcs/create-chat';
import { redirectIfNotLoggedIn } from '~/utils/loaders';
import { create400Json, processApiError } from '~/utils/request-helpers';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import NewChat from '~/page-components/Chat/NewChat';
import { returnIfRestricted } from '~/utils/restriction-utils.server';

export async function loader(args: LoaderFunctionArgs) {
  const user = await redirectIfNotLoggedIn(args);

  return {
    currentUser: user,
    pagesPath: args.context.cloudflare.env.PAGES_PATH,
  };
}

export async function action(args: ActionFunctionArgs) {
  const currentUser = await redirectIfNotLoggedIn(args);
  const formData = await args.request.formData();
  const message = formData.get('message');
  const toUserIdStr = formData.get('toUserId');
  if (!message || !toUserIdStr) {
    return create400Json('Missing message or toUserId');
  }
  const toUserId = parseInt(toUserIdStr as string);
  if (isNaN(toUserId)) {
    return create400Json('Invalid toUserId');
  }

  const returnRes = await returnIfRestricted(args, '/me/messages/new', 'chat');
  if (returnRes) return returnRes;

  const createChatResult = await createChat({
    db: args.context.cloudflare.env.DB,
    fromUserId: currentUser.userId,
    toUserId,
    message: message as string,
  });

  if (createChatResult.err) {
    return processApiError('Error creating chat', createChatResult.err);
  }

  const chatToken = createChatResult.result.chatToken;
  return redirect(`/me/messages/${chatToken}`);
}

export default function NewMessage() {
  const { currentUser, pagesPath } = useLoaderData<typeof loader>();

  const submitFetcher = useGoodFetcher({
    method: 'post',
  });

  return (
    <NewChat
      currentUser={currentUser}
      isSending={submitFetcher.isLoading}
      onCreateChat={(message, toUserId) =>
        submitFetcher.submit({
          message: message.trim(),
          toUserId: toUserId,
        })
      }
      pagesPath={pagesPath}
      messagesBasePath="/me/messages"
    />
  );
}
