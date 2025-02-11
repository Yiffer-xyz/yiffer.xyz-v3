import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { format } from 'date-fns';
import Breadcrumbs from '~/ui-components/Breadcrumbs/Breadcrumbs';
import { capitalizeString } from '~/utils/general';
import { fullUserLoader } from '~/utils/loaders';
import ChangePasswordOrEmail from './ChangePasswordOrEmail';
export { YifferErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction = () => {
  return [{ title: `Account | Yiffer.xyz` }];
};

export async function loader(args: LoaderFunctionArgs) {
  const user = await fullUserLoader(args);
  return { user };
}

export default function AccountPage() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto pb-12">
      <h1>Account settings</h1>

      <Breadcrumbs
        prevRoutes={[{ text: 'Me', href: '/me' }]}
        currentRoute="Account settings"
      />

      <p className="mt-6">
        <span className="font-bold">Username:</span> {user.username}
      </p>

      <p className="mt-2">
        <span className="font-bold">Email:</span> {user.email ?? 'Missing'}
      </p>

      <p className="mt-2">
        <span className="font-bold">User type</span>: {capitalizeString(user.userType)}
      </p>

      <p className="mt-2">
        <span className="font-bold">Account created</span>:{' '}
        {format(user.createdTime, 'PPPP')}
      </p>

      <ChangePasswordOrEmail />
    </div>
  );
}
