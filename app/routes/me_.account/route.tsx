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

  const borderClass =
    'flex flex-row justify-between items-center border-b border-gray-850 dark:border-gray-500 px-3.5 h-14 gap-8';
  const clickableClass = 'cursor-pointer hover:bg-blue-more-trans';
  const rowTitleClass = 'text-sm text-gray-700 dark:text-gray-750 -mb-1';
  const rowClass = 'flex flex-row gap-3 items-center';
  const chevronClass = 'text-gray-700 dark:text-gray-750 text-xs';
  const iconClass = 'text-gray-500 dark:text-gray-800';

  return (
    <div className="container mx-auto pb-12">
      <h1>Account settings</h1>

      <Breadcrumbs
        prevRoutes={[{ text: 'Me', href: '/me' }]}
        currentRoute="Account settings"
      />

      {!isChangingSomething && (
        <div className="w-full md:w-fit">
          <div className="rounded-md border border-gray-850 dark:border-gray-500">
            <div
              className={`${borderClass} ${clickableClass}`}
              role="button"
              tabIndex={0}
              onClick={() => setIsChangingUsername(true)}
            >
              <div className={rowClass}>
                <FaUser className={iconClass} />
                <div>
                  <p className={rowTitleClass}>Username</p>
                  <p className="-mt-0.5">{user.username}</p>
                </div>
              </div>
              <FaChevronRight className={chevronClass} />
            </div>
            <div
              className={`${borderClass} ${clickableClass}`}
              tabIndex={0}
              onClick={() => setIsChangingEmail(true)}
            >
              <div className={rowClass}>
                <FaEnvelope className={iconClass} />
                <div>
                  <p className={rowTitleClass}>Email</p>
                  <p className="-mt-0.5">{user.email ?? 'Missing'}</p>
                </div>
              </div>
              <FaChevronRight className={chevronClass} />
            </div>
            <div
              className={`${borderClass} ${clickableClass}`}
              tabIndex={0}
              onClick={() => setIsChangingPassword(true)}
            >
              <div className={rowClass}>
                <FaLock className={iconClass} />
                <div>
                  <p className="-mt-0.5">Change password</p>
                </div>
              </div>
              <FaChevronRight className={chevronClass} />
            </div>
            <div className={`${borderClass} ${clickableClass} border-b-0!`} tabIndex={0}>
              <div className={rowClass}>
                <FaMessage className={iconClass} />
                <div>
                  <p className={rowTitleClass}>Messages</p>
                  <p className="-mt-0.5">Allow messages</p>
                </div>
              </div>
              <FaChevronRight className={chevronClass} />
            </div>
          </div>

          <div className="rounded-md border border-gray-850 dark:border-gray-500 mt-8">
            <div className={`${borderClass}`}>
              <div className={rowClass}>
                <div>
                  <p className={rowTitleClass}>Account created</p>
                  <p className="-mt-0.5">{format(user.createdTime, 'PPP')}</p>
                </div>
              </div>
            </div>
            <div className={`${borderClass} border-b-0!`}>
              <div className={rowClass}>
                <div>
                  <p className={rowTitleClass}>User type</p>
                  <p className="-mt-0.5">{capitalizeString(user.userType)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
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
