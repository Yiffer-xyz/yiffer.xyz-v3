import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { MdArrowForward, MdArrowBack } from 'react-icons/md';
import { getModCommentList } from '~/route-funcs/get-mod-comment-list';
import { ADMIN_COMMENTLIST_PAGE_SIZE } from '~/types/constants';
import Button from '~/ui-components/Buttons/Button';
import SingleComment from '~/ui-components/Comments/SingleComment';
import { processApiError } from '~/utils/request-helpers';
import { redirectIfNotMod } from '~/utils/loaders';
export { AdminErrorBoundary as ErrorBoundary } from '~/utils/error';

const PAGE_SIZE = ADMIN_COMMENTLIST_PAGE_SIZE;

export const meta: MetaFunction = () => {
  return [{ title: `Mod: Comment list | Yiffer.xyz` }];
};

export async function loader(args: LoaderFunctionArgs) {
  const user = await redirectIfNotMod(args);
  const url = new URL(args.request.url);
  const page = url.searchParams.get('page');
  const pageNum = page ? parseInt(page) : 1;

  const comments = await getModCommentList(
    args.context.cloudflare.env.DB,
    pageNum,
    user.userId
  );

  if (comments.err) {
    return processApiError('Error getting comment list', comments.err);
  }

  return {
    comments: comments.result,
    pageNum,
    pagesPath: args.context.cloudflare.env.PAGES_PATH,
  };
}

export default function More() {
  const { comments, pageNum, pagesPath } = useLoaderData<typeof loader>();

  const navigate = useNavigate();

  function onPaginate(forward: boolean) {
    navigate(`/admin/more/comment-list?page=${forward ? pageNum + 1 : pageNum - 1}`);
  }

  const showButtons = pageNum > 1 || comments.length === PAGE_SIZE;

  return (
    <>
      <h1 className="mb-1">Comment list</h1>

      {showButtons && (
        <div className="flex gap-2 mb-2 -ml-2.5">
          {pageNum > 1 && (
            <Button
              variant="naked"
              startIcon={MdArrowBack}
              text={`Prev ${PAGE_SIZE}`}
              onClick={() => onPaginate(false)}
            />
          )}
          {comments.length === PAGE_SIZE && (
            <Button
              variant="naked"
              endIcon={MdArrowForward}
              text={`Next ${PAGE_SIZE}`}
              onClick={() => onPaginate(true)}
            />
          )}
        </div>
      )}

      {comments.length > 0 && (
        <div className="flex flex-col gap-4">
          {comments.map(c => (
            <SingleComment
              comment={c}
              pagesPath={pagesPath}
              isAdminPanel
              key={c.id}
              showLowScoreComments
              isLoggedIn
            />
          ))}
        </div>
      )}
    </>
  );
}
