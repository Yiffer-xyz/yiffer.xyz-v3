import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import Button from '~/ui-components/Buttons/Button';
import { makeDbErr, processApiError } from '~/utils/request-helpers';
import { redirectIfNotMod } from '~/utils/loaders';
import {
  Table,
  TableBody,
  TableCell,
  TableHeadRow,
  TableRow,
} from '~/ui-components/Table';
import { queryDb } from '~/utils/database-facade';
import { useState } from 'react';
import TextInput from '~/ui-components/TextInput/TextInput';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import { parseDbDateStr } from '~/utils/date-utils';
import { capitalizeString } from '~/utils/general';
import { format } from 'date-fns';
import Username from '~/ui-components/Username';
export { AdminErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction = () => {
  return [{ title: `Mod: Restricted users | Yiffer.xyz` }];
};

export async function loader(args: LoaderFunctionArgs) {
  await redirectIfNotMod(args);

  const query = `SELECT userrestriction.id, startDate, endDate, restrictionType, user.username, user.id AS userId
    FROM userrestriction
    INNER JOIN user ON (userrestriction.userId = user.id)
    ORDER BY startDate DESC`;

  const dbRes = await queryDb<
    {
      id: number;
      startDate: string;
      endDate: string;
      restrictionType: string;
      username: string;
      userId: number;
    }[]
  >(args.context.cloudflare.env.DB, query, null, 'Restricted users');

  if (dbRes.isError) {
    return processApiError('Error getting chat list admin', makeDbErr(dbRes));
  }

  return {
    restrictedUsers: dbRes.result.map(row => ({
      id: row.id,
      startDate: parseDbDateStr(row.startDate),
      endDate: parseDbDateStr(row.endDate),
      restrictionType: row.restrictionType,
      username: row.username,
      userId: row.userId,
    })),
    pagesPath: args.context.cloudflare.env.PAGES_PATH,
  };
}

export default function IpBanList() {
  const { restrictedUsers, pagesPath } = useLoaderData<typeof loader>();

  const [restrictionUnrestrictLoading, setRestrictionUnrestrictLoading] = useState<
    number | null
  >(null);

  const unrestrictUserFetcher = useGoodFetcher({
    url: '/api/admin/unrestrict-user',
    method: 'post',
    toastSuccessMessage: 'Restriction removed',
    onFinish: () => {
      setRestrictionUnrestrictLoading(null);
    },
  });

  function onUnrestrictUser(id: number) {
    setRestrictionUnrestrictLoading(id);
    unrestrictUserFetcher.submit({ id });
  }

  return (
    <>
      <h1 className="mb-1">Restricted users</h1>

      <Table className="mt-2" horizontalScroll>
        <TableHeadRow>
          <TableCell>User</TableCell>
          <TableCell>Restriction</TableCell>
          <TableCell>Dates</TableCell>
          <TableCell> </TableCell>
        </TableHeadRow>
        <TableBody>
          {restrictedUsers.map((restriction, index) => (
            <TableRow key={restriction.id} includeBorderTop={index === 0}>
              <TableCell>
                <Username
                  username={restriction.username}
                  id={restriction.userId}
                  pagesPath={pagesPath}
                />
              </TableCell>
              <TableCell>{capitalizeString(restriction.restrictionType)}</TableCell>
              <TableCell>
                {format(restriction.startDate, 'PP')} -{' '}
                {format(restriction.endDate, 'PP')}
              </TableCell>
              <TableCell>
                <LoadingButton
                  variant="naked"
                  className="py-0.5! p-2! -mr-2"
                  text="Remove"
                  onClick={() => onUnrestrictUser(restriction.id)}
                  isLoading={restrictionUnrestrictLoading === restriction.id}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
