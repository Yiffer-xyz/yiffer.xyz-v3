import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { RiAccountCircleFill } from 'react-icons/ri';
import LinkCard from '~/ui-components/LinkCard/LinkCard';
import { redirectIfNotLoggedIn } from '~/utils/loaders';

export async function loader(args: LoaderFunctionArgs) {
  const user = await redirectIfNotLoggedIn(args);
  return user;
}

export default function AccountPage() {
  const user = useLoaderData<typeof loader>();

  return (
    <div className="mx-auto w-fit px-4 pb-8">
      <h1>Account</h1>
      <p>
        <RiAccountCircleFill /> {user?.username}
      </p>

      <div className="w-fit">
        <LinkCard
          href="/me/account"
          title="Account settings"
          includeRightArrow
          description="Change email, password"
          className="mt-4"
        />

        <LinkCard
          href="/contribute"
          title="Contributions"
          includeRightArrow
          description="See your contributions to Yiffer.xyz and make new ones"
          className="mt-4"
        />

        <LinkCard
          href="#"
          title="Advertising"
          includeRightArrow
          description="See and manage your ads"
          className="mt-4"
        />

        <LinkCard
          href="#"
          title="Patreon"
          includeRightArrow
          description="See and manage your Patreon subscription and rewards"
          className="mt-4"
        />

        <LinkCard
          href="#"
          title="Public profile"
          description="Coming soon"
          className="mt-4"
          disabled
        />

        <LinkCard
          href="#"
          title="Bookmarked and rated comics"
          description="Coming soon"
          className="mt-4"
          disabled
        />

        <LinkCard
          href="#"
          title="Activity center"
          description="Coming soon"
          className="mt-4"
          disabled
        />
      </div>
    </div>
  );
}
