import { Outlet, useNavigate, useOutletContext } from '@remix-run/react';
import { useEffect, useState } from 'react';
import type { GlobalAdminContext } from '~/routes/admin';
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
import { unstable_defineAction } from '@remix-run/cloudflare';
export { AdminErrorBoundary as ErrorBoundary } from '~/utils/error';

export default function UserManager() {
  const navigate = useNavigate();
  const globalContext: GlobalAdminContext = useOutletContext();

  // TODO: Debounce.
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User>();

  const { data: userSearchResults, submit: searchUsers } = useGoodFetcher<User[]>({
    method: 'post',
  });

  function onUserSelect(user: User) {
    setSelectedUser(user);
    setUserSearch('');
  }

  function onUserSearchUpdate(newVal: string) {
    if (!newVal) return;
    setUserSearch(newVal);
    setSelectedUser(undefined);
    navigate('/admin/users');
  }

  useEffect(() => {
    if (!userSearch || userSearch.length < 3) {
      return;
    }
    searchUsers({ searchText: userSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSearch]);

  useEffect(() => {
    if (!selectedUser) return;
    navigate(`/admin/users/${selectedUser.id}`);
  }, [selectedUser, navigate]);

  return (
    <>
      <h1>User manager</h1>
      <p className="font-bold mb-4">ℹ️ See the figma prototype.</p>

      <TextInput
        value={userSearch}
        onChange={onUserSearchUpdate} // TODO: Debounce this
        label="Search username or email"
        name="user-search"
        className="mb-8"
      />

      {userSearch &&
        userSearchResults?.map(user => (
          <div key={user.id} className="my-4">
            <Button onClick={() => onUserSelect(user)} text="Select user" />
            <pre>{JSON.stringify(user, null, 2)}</pre>
          </div>
        ))}

      <Outlet context={globalContext} />
    </>
  );
}

export const action = unstable_defineAction(async args => {
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
});
