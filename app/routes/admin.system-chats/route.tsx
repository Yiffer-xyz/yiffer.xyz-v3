import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { processApiError } from '~/utils/request-helpers';
import { redirectIfNotAdmin } from '~/utils/loaders';
import { getChatList } from '~/route-funcs/get-chat-list';
import FullChatBox from '~/page-components/Chat/FullChatBox';
export { AdminErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction = () => {
  return [{ title: `Mod: System chats | Yiffer.xyz` }];
};

export async function loader(args: LoaderFunctionArgs) {
  await redirectIfNotAdmin(args);
  const url = new URL(args.request.url);
  const pageParam = url.searchParams.get('page');
  const page = pageParam ? parseInt(pageParam) : 1;

  const chatsRes = await getChatList({
    db: args.context.cloudflare.env.DB,
    systemChatMode: 'only-system',
    clearChatNotification: false,
  });

  if (chatsRes.err) {
    return processApiError('Error getting system chat list', chatsRes.err);
  }

  return {
    chats: chatsRes.result,
    page,
    pagesPath: args.context.cloudflare.env.PAGES_PATH,
  };
}

export default function More() {
  const { chats, pagesPath } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-6xl">
      <h1 className="mb-4">System chats</h1>

      <FullChatBox
        chats={chats}
        currentUser={null}
        messagesBasePath="/admin/system-chats"
        pagesPath={pagesPath}
        topSitePartHeight={170}
      />
    </div>
  );
}
