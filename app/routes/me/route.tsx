import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { RiAccountCircleFill } from 'react-icons/ri';
import Breadcrumbs from '~/ui-components/Breadcrumbs/Breadcrumbs';
import LinkCard from '~/ui-components/LinkCard/LinkCard';
import { redirectIfNotLoggedIn } from '~/utils/loaders';
export { YifferErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction = () => {
  return [{ title: `Me | Yiffer.xyz` }];
};

export async function loader(args: LoaderFunctionArgs) {
  const user = await redirectIfNotLoggedIn(args);
  return user;
}

export default function AccountPage() {
  const user = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto pb-8">
      <h1>Me</h1>

      <Breadcrumbs prevRoutes={[]} currentRoute="Me" className="!mb-2" />

      <p className="text-lg">
        <RiAccountCircleFill /> {user?.username}
      </p>

      <div className="w-fit">
        <LinkCard
          href={`/user/${user.username}?source=me`}
          title="Profile"
          includeRightArrow
          description="See and edit your public profile"
          className="mt-4"
        />

        <LinkCard
          href="/me/account"
          title="Account settings"
          includeRightArrow
          description="Change username, email, or password"
          className="mt-4"
        />

        <LinkCard
          href="/contribute?source=me"
          title="Contributions"
          includeRightArrow
          description="See your contributions to Yiffer.xyz and make new ones"
          className="mt-4"
        />

        <LinkCard
          href="/advertising"
          title="Advertising"
          includeRightArrow
          description="Manage your ads and submit new ones"
          className="mt-4"
        />

        <LinkCard
          href="/me/patreon"
          title="Patreon"
          includeRightArrow
          description="See and manage your Patreon subscription and rewards"
          className="mt-4"
        />

        <LinkCard
          href="/me/messages"
          title="Messages"
          includeRightArrow
          description="See and manage your messages"
          className="mt-4"
        />

        <LinkCard href="/logout" title="Log out" className="mt-4" />
      </div>
    </div>
  );
}
