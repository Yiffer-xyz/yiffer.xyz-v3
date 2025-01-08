import { Outlet, useNavigate, useOutlet, useOutletContext } from '@remix-run/react';
import { useEffect, useState } from 'react';
import type { GlobalAdminContext } from '~/routes/admin/route';
import type { User } from '~/types/types';
import TextInput from '~/ui-components/TextInput/TextInput';
import { searchUsers } from '~/route-funcs/get-user';
import {
  create400Json,
  createSuccessJson,
  processApiError,
} from '~/utils/request-helpers';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import Button from '~/ui-components/Buttons/Button';
import { debounce } from '~/utils/general';
import {
  Table,
  TableBody,
  TableCell,
  TableHeadRow,
  TableRow,
} from '~/ui-components/Table';
import type { ActionFunctionArgs, MetaFunction } from '@remix-run/cloudflare';

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

  function onUserSelect(user: User) {
    setSelectedUser(user);
    setUserSearch('');
  }

  function onUserSearchUpdate(newVal: string) {
    setUserSearch(newVal);
    setSelectedUser(undefined);
    navigate('/admin/users');
  }

  useEffect(() => {
    if (!userSearch || userSearch.length < 3) {
      return;
    }
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

          <Table className="mb-6">
            <TableHeadRow isTableMaxHeight>
              <TableCell> </TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Last Action</TableCell>
            </TableHeadRow>
            <TableBody>
              {userSearch &&
                userSearchResults?.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Button onClick={() => onUserSelect(user)} text="Select user" />
                    </TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.createdTime.toLocaleDateString()}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.userType}</TableCell>
                    <TableCell>LAST ACTION DOES NOT EXIST</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </>
      )}
      <Outlet context={globalContext} />
    </>
  );
}

export async function action(args: ActionFunctionArgs) {
  const formDataBody = await args.request.formData();
  const searchText = formDataBody.get('searchText');

  if (!searchText || searchText.toString().length < 3) {
    return create400Json('Missing or too short searchText');
  }

  const userResult = await searchUsers(
    args.context.cloudflare.env.DB,
    searchText.toString()
  );
  if (userResult.err) {
    return processApiError('Error searching users', userResult.err);
  }

  return createSuccessJson(userResult.result);
}
