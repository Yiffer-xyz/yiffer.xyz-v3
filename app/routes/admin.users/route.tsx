import { Outlet, useNavigate, useOutlet, useOutletContext } from '@remix-run/react';
import { useEffect, useState } from 'react';
import type { GlobalAdminContext } from '~/routes/admin/route';
import type { User } from '~/types/types';
import TextInput from '~/ui-components/TextInput/TextInput';
import { searchUsers } from '~/route-funcs/get-user';
import { createSuccessJson, processApiError } from '~/utils/request-helpers';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import { capitalizeString, debounce } from '~/utils/general';
import {
  Table,
  TableBody,
  TableCell,
  TableHeadRow,
  TableRow,
} from '~/ui-components/Table';
import type { ActionFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { getTimeAgoShort } from '~/utils/date-utils';
import { format } from 'date-fns';
import Link from '~/ui-components/Link';

export { AdminErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction = () => {
  return [{ title: `Mod: Users | Yiffer.xyz` }];
};

export default function UserManager() {
  const navigate = useNavigate();
  const globalContext: GlobalAdminContext = useOutletContext();
  const outlet = useOutlet();

  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User>();

  const { data: userSearchResults, submit: searchUsers } = useGoodFetcher<User[]>({
    method: 'post',
  });
  const debouncedSearchUsers = debounce(searchUsers, 500);

  function onUserSearchUpdate(newVal: string) {
    setUserSearch(newVal);
    setSelectedUser(undefined);
    navigate('/admin/users');
  }

  useEffect(() => {
    debouncedSearchUsers({ searchText: userSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSearch]);

  useEffect(() => {
    if (!selectedUser) return;
    navigate(`/admin/users/${selectedUser.id}`);
  }, [selectedUser, navigate]);

  return (
    <>
      {!outlet && (
        <>
          <h1>User manager</h1>

          <TextInput
            value={userSearch}
            onChange={onUserSearchUpdate}
            label="Search username or email"
            name="user-search"
            className="mb-8 max-w-sm"
          />

          {userSearchResults && userSearchResults.length > 0 && (
            <Table className="mb-6">
              <TableHeadRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Seen</TableCell>
              </TableHeadRow>

              <TableBody>
                {userSearchResults?.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <p>
                        <Link
                          href={`/admin/users/${user.id}`}
                          text={user.username}
                          showRightArrow
                          isInsideParagraph
                        />
                      </p>
                    </TableCell>
                    <TableCell>{capitalizeString(user.userType)}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <p title={format(user.createdTime, 'PPPppp')}>
                        {user.createdTime ? getTimeAgoShort(user.createdTime) : '-'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p
                        title={
                          user.lastActionTime
                            ? format(user.lastActionTime, 'PPPppp')
                            : undefined
                        }
                      >
                        {user.lastActionTime ? getTimeAgoShort(user.lastActionTime) : '-'}
                      </p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </>
      )}
      <Outlet context={globalContext} />
    </>
  );
}

export async function action(args: ActionFunctionArgs) {
  const formDataBody = await args.request.formData();
  const searchText = formDataBody.get('searchText');

  const userResult = await searchUsers(
    args.context.cloudflare.env.DB,
    searchText ? searchText.toString() : ''
  );
  if (userResult.err) {
    return processApiError('Error searching users', userResult.err);
  }

  return createSuccessJson(userResult.result);
}
