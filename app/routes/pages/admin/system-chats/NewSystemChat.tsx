import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { redirect, useLoaderData } from 'react-router';
import { createChat } from '~/route-funcs/create-chat';
import { redirectIfNotAdmin } from '~/utils/loaders';
import { create400Json, processApiError } from '~/utils/request-helpers';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import NewChat from '~/page-components/Chat/NewChat';

export async function loader(args: LoaderFunctionArgs) {
  await redirectIfNotAdmin(args);

  return {
    pagesPath: args.context.cloudflare.env.PAGES_PATH,
  };
}

export async function action(args: ActionFunctionArgs) {
  await redirectIfNotAdmin(args);
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

  const createChatResult = await createChat({
    db: args.context.cloudflare.env.DB,
    fromUserId: null,
    toUserId,
    message: message as string,
  });

  if (createChatResult.err) {
    return processApiError('Error creating chat', createChatResult.err);
  }

  const chatToken = createChatResult.result.chatToken;
  return redirect(`/admin/system-chats/${chatToken}`);
}

export default function NewSystemChat() {
  const { pagesPath } = useLoaderData<typeof loader>();

  const submitFetcher = useGoodFetcher({
    method: 'POST',
  });

  return (
    <NewChat
      currentUser={null}
      isSending={submitFetcher.isLoading}
      onCreateChat={(message, toUserId) =>
        submitFetcher.submit({
          message: message.trim(),
          toUserId: toUserId,
        })
      }
      pagesPath={pagesPath}
      messagesBasePath="/admin/system-chats"
    />
  );
}
