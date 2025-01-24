import { useLoaderData } from '@remix-run/react';
import { MdArrowForward, MdLogin } from 'react-icons/md';
import Link from '~/ui-components/Link';
import type { authLoader } from '~/utils/loaders';
import Breadcrumbs from '~/ui-components/Breadcrumbs/Breadcrumbs';
import type { MetaFunction } from '@remix-run/cloudflare';
export { YifferErrorBoundary as ErrorBoundary } from '~/utils/error';
export { authLoader as loader } from '~/utils/loaders';

export const meta: MetaFunction = () => {
  return [{ title: `Join us | Yiffer.xyz` }];
};

export default function JoinUs() {
  return (
    <div className="container mx-auto pb-8">
      <h1>Join us</h1>

      <Breadcrumbs
        prevRoutes={[{ text: 'Contribute', href: '/contribute' }]}
        currentRoute="Join us"
      />

      <p className="mb-4">
        Yiffer.xyz would not be what it is without our wonderful mods.
      </p>
      <p className="mb-4">
        If we are satisfied with the amount of mods we currently have, you may be put on a
        waiting list. While it might be the case that more is better, we believe it wise
        to keep the number from being too high.
      </p>
      <ApplyLink />

      <h3 className="font-bold">What are a mod&apos;s tasks?</h3>
      <p>
        Your main tasks as a mod will be keeping comics up to date, and well as adding new
        ones. With our new contributions system, much of this will be done through
        processing user suggestions and submissions, but you're always free to add new
        comics on your own too. We've built a functional mod panel, built for phones as
        well as desktop.
      </p>

      <h3 className="font-bold mt-4">How much do I have to &quot;work&quot;?</h3>
      <p className="mb-4">
        There is no defined lower requirement for how much a mod should contribute. In the
        admin panel, there is a &quot;Mod scoreboard&quot; that we hope might motivate
        people to do more, but you should not feel bad for not being far up. If we notice
        that someone is really slacking off, and see no activity for months, we will
        always message the person in question before taking any action. If you at any
        point wish to stop being a mod, please do say so instead of simply going inactive.
      </p>
      <ApplyLink />
    </div>
  );
}

const ApplyLink = () => {
  const user = useLoaderData<typeof authLoader>();

  return user ? (
    <p className="mb-6">
      <Link
        href="/contribute/join-us/apply"
        text="Apply as a mod here"
        IconRight={MdArrowForward}
      />
    </p>
  ) : (
    <p className="mb-6">
      <b>To apply as a mod, </b>
      <Link href="/login" text="Log in" Icon={MdLogin} />
    </p>
  );
};
