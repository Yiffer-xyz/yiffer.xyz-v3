import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData, useNavigate } from '@remix-run/react';
import Link from '~/ui-components/Link';
import {
  Table,
  TableBody,
  TableCell,
  TableHeadRow,
  TableRow,
} from '~/ui-components/Table';
import { processApiError } from '~/utils/request-helpers';
import ModContributionPointInfo from '~/ui-components/ModContributionPointInfo';
import { getModActions } from '~/route-funcs/get-mod-actions';
import { getTimeAgoShort } from '~/utils/date-utils';
import { getModActionName } from '~/types/constants';
import Button from '~/ui-components/Buttons/Button';
import { MdArrowBack, MdArrowForward } from 'react-icons/md';
export { AdminErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction = () => {
  return [{ title: `Mod: Actions & Points | Yiffer.xyz` }];
};

export async function loader(args: LoaderFunctionArgs) {
  const url = new URL(args.request.url);
  const page = url.searchParams.get('page');
  const pageNum = page ? parseInt(page) : 1;

  const modActionsRes = await getModActions(args.context.cloudflare.env.DB, pageNum);

  if (modActionsRes.err) {
    return processApiError(
      'Error getting all mod actions in /admin/actions-and-points loader',
      modActionsRes.err
    );
  }

  return { modActions: modActionsRes.result, pageNum };
}

export default function Stats() {
  const { modActions, pageNum } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  function onPaginate(forward: boolean) {
    navigate(`/admin/actions-and-points?page=${forward ? pageNum + 1 : pageNum - 1}`);
  }

  return (
    <>
      <h1>Mod Actions & Points</h1>

      <div className="my-2">
        <ModContributionPointInfo />
      </div>

      <h2>Mod action log</h2>

      <div className="flex gap-2 -ml-2.5 mb-1">
        {pageNum > 1 && (
          <Button
            variant="naked"
            startIcon={MdArrowBack}
            text="Prev 50"
            onClick={() => onPaginate(false)}
          />
        )}
        {modActions.length > 0 && (
          <Button
            variant="naked"
            endIcon={MdArrowForward}
            text="Next 50"
            onClick={() => onPaginate(true)}
          />
        )}
      </div>

      {modActions.length > 0 && (
        <>
          <Table horizontalScroll>
            <TableHeadRow>
              <TableCell>User</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Pts</TableCell>
              <TableCell>When</TableCell>
              <TableCell>Comic/artist</TableCell>
              <TableCell>Details</TableCell>
            </TableHeadRow>
            <TableBody>
              {modActions.map(a => (
                <TableRow key={a.id}>
                  <TableCell>
                    <Link href={`/admin/users/${a.user.id}`} text={a.user.username} />
                  </TableCell>
                  <TableCell>{getModActionName(a.actionType)}</TableCell>
                  <TableCell>{a.points}</TableCell>
                  <TableCell>{getTimeAgoShort(a.timestamp)}</TableCell>
                  <TableCell>
                    {a.comic && (
                      <Link href={`/admin/comics/${a.comic.id}`} text={a.comic.name} />
                    )}
                    {a.artist && (
                      <Link href={`/admin/artists/${a.artist.id}`} text={a.artist.name} />
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="whitespace-pre">{a.text}</p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex gap-2 mt-1">
            {pageNum > 1 && (
              <Button
                variant="naked"
                startIcon={MdArrowBack}
                text="Prev 50"
                onClick={() => onPaginate(false)}
              />
            )}
            <Button
              variant="naked"
              endIcon={MdArrowForward}
              text="Next 50"
              onClick={() => onPaginate(true)}
            />
          </div>
        </>
      )}
    </>
  );
}
