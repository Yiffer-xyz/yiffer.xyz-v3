import type { LoaderFunctionArgs, MetaFunction } from 'react-router';
import { useLoaderData, useNavigate } from 'react-router';
import { MdArrowForward, MdArrowBack } from 'react-icons/md';
import { ADMIN_CHAT_LIST_PAGESIZE } from '~/types/constants';
import Button from '~/ui-components/Buttons/Button';
import { processApiError } from '~/utils/request-helpers';
import { redirectIfNotAdmin } from '~/utils/loaders';
import { getChatList } from '~/route-funcs/get-chat-list';
import {
  Table,
  TableBody,
  TableCell,
  TableHeadRow,
  TableRow,
} from '~/ui-components/Table';
import Username from '~/ui-components/Username';
import ProfilePicture from '~/ui-components/ProfilePicture';
import { getTimeAgoShort } from '~/utils/date-utils';
import { RiCheckDoubleLine } from 'react-icons/ri';
import Link from '~/ui-components/Link';
export { AdminErrorBoundary as ErrorBoundary } from '~/utils/error';

const PAGE_SIZE = ADMIN_CHAT_LIST_PAGESIZE;

export const meta: MetaFunction = () => {
  return [{ title: `Mod: Chat list | Yiffer.xyz` }];
};

export async function loader(args: LoaderFunctionArgs) {
  await redirectIfNotAdmin(args);
  const url = new URL(args.request.url);
  const pageParam = url.searchParams.get('page');
  const page = pageParam ? parseInt(pageParam) : 1;

  const chatsRes = await getChatList({
    db: args.context.cloudflare.env.DB,
    systemChatMode: 'exclude',
    clearChatNotification: false,
    page,
  });

  if (chatsRes.err) {
    return processApiError('Error getting chat list admin', chatsRes.err);
  }

  return {
    chats: chatsRes.result,
    page,
    pagesPath: args.context.cloudflare.env.PAGES_PATH,
  };
}

export default function ChatListPage() {
  const { chats, page, pagesPath } = useLoaderData<typeof loader>();

  const navigate = useNavigate();

  function onPaginate(forward: boolean) {
    navigate(`/admin/more/chat-list?page=${forward ? page + 1 : page - 1}`);
  }

  const showButtons = page > 1 || chats.length === PAGE_SIZE;

  return (
    <>
      <h1 className="mb-1">Chat list</h1>

      {showButtons && (
        <div className="flex gap-2 mb-2 -ml-2.5">
          {page > 1 && (
            <Button
              variant="naked"
              startIcon={MdArrowBack}
              text={`Prev ${PAGE_SIZE}`}
              onClick={() => onPaginate(false)}
            />
          )}
          {chats.length === PAGE_SIZE && (
            <Button
              variant="naked"
              endIcon={MdArrowForward}
              text={`Next ${PAGE_SIZE}`}
              onClick={() => onPaginate(true)}
            />
          )}
        </div>
      )}

      {chats.length > 0 && (
        <Table className="" horizontalScroll="mobile-only">
          <TableHeadRow isTableMaxHeight={false}>
            <TableCell>Users</TableCell>
            <TableCell>Latest</TableCell>
            <TableCell>Latest message</TableCell>
            <TableCell> </TableCell>
          </TableHeadRow>
          <TableBody>
            {chats.map((c, index) => (
              <TableRow
                key={c.token}
                className="border-b border-gray-800 dark:border-gray-500"
              >
                <TableCell>
                  <div className="flex flex-row items-center gap-2">
                    <ProfilePicture
                      className="w-10 h-10"
                      iconSizeClassName="text-lg"
                      pagesPath={pagesPath}
                      user={c.members[0]}
                    />
                    <Username
                      id={c.members[0].id}
                      username={c.members[0].username}
                      pagesPath={pagesPath}
                      positionVertical={index === 0 ? 'bottom' : 'top'}
                    />
                  </div>
                  {c.members.length > 1 && (
                    <div className="flex flex-row items-center gap-2 mt-2">
                      <ProfilePicture
                        className="w-10 h-10"
                        iconSizeClassName="text-lg"
                        pagesPath={pagesPath}
                        user={c.members[1]}
                      />
                      <Username
                        id={c.members[1].id}
                        username={c.members[1].username}
                        pagesPath={pagesPath}
                        positionVertical={index === 0 ? 'bottom' : 'top'}
                      />
                    </div>
                  )}
                </TableCell>
                <TableCell>{getTimeAgoShort(c.latestMessage!.timestamp)}</TableCell>
                <TableCell className="max-w-[300px] min-w-[300px] lg:max-w-[500px]">
                  <p className="whitespace-pre-wrap break-all">
                    {c.latestMessage!.content}
                  </p>
                  <p className="text-xs mt-1">
                    by {c.members.find(m => m.id === c.latestMessage?.senderId)?.username}
                    {c.isRead && <RiCheckDoubleLine className="ml-3" />}
                    {c.isRead && ' read'}
                  </p>
                </TableCell>
                <TableCell>
                  <Link href={`/admin/chats/${c.token}`} showRightArrow text="View" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}
