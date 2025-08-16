import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { redirect, useLoaderData } from '@remix-run/react';
import { format } from 'date-fns';
import Breadcrumbs from '~/ui-components/Breadcrumbs/Breadcrumbs';
import { capitalizeString } from '~/utils/general';
import { fullUserLoader } from '~/utils/loaders';
import ChangeAccountData from './ChangeAccountData';
import { FaChevronRight, FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import { FaMessage } from 'react-icons/fa6';
import { useState } from 'react';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import ListButtons from '~/ui-components/ListButtons/ListButtons';
export { YifferErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction = () => {
  return [{ title: `Account | Yiffer.xyz` }];
};

export async function loader(args: LoaderFunctionArgs) {
  const user = await fullUserLoader(args);
  if (!user) {
    return redirect('/');
  }
  return { user };
}

export default function AccountPage() {
  const { user } = useLoaderData<typeof loader>();

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isChangingUsername, setIsChangingUsername] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const isChangingSomething = isChangingPassword || isChangingUsername || isChangingEmail;

  const updateAllowMessagesFetcher = useGoodFetcher({
    url: '/api/set-allow-messages',
    method: 'post',
  });

  return (
    <div className="container mx-auto pb-12">
      <h1>Account settings</h1>

      <Breadcrumbs
        prevRoutes={[{ text: 'Me', href: '/me' }]}
        currentRoute="Account settings"
      />

      {!isChangingSomething && (
        <ListButtons
          items={[
            {
              onClick: () => setIsChangingUsername(true),
              Icon: FaUser,
              title: 'Username',
              text: user.username,
            },
            {
              onClick: () => setIsChangingEmail(true),
              Icon: FaEnvelope,
              title: 'Email',
              text: user.email ?? 'Missing',
            },
            {
              onClick: () => setIsChangingPassword(true),
              Icon: FaLock,
              title: 'Password',
              text: 'Change password',
            },
            {
              onClick: () =>
                !updateAllowMessagesFetcher.isLoading &&
                updateAllowMessagesFetcher.submit({ allowMessages: !user.allowMessages }),
              Icon: FaMessage,
              title: 'Messages',
              text: user.allowMessages
                ? 'Allow new messages'
                : "Don't allow new messages",
            },
          ]}
        />
      )}

      {isChangingSomething && (
        <ChangeAccountData
          isChangingPassword={isChangingPassword}
          isChangingEmail={isChangingEmail}
          isChangingUsername={isChangingUsername}
          onDone={() => {
            setIsChangingPassword(false);
            setIsChangingEmail(false);
            setIsChangingUsername(false);
          }}
        />
      )}
    </div>
  );
}
