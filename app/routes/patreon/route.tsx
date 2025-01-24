import Breadcrumbs from '~/ui-components/Breadcrumbs/Breadcrumbs';
import Link from '~/ui-components/Link';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import PatronList from './patronList';
import { useLoaderData } from '@remix-run/react';
import { getPatrons } from '~/route-funcs/get-patrons';
import { processApiError } from '~/utils/request-helpers';
import type { Patron } from '~/types/types';
export { YifferErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction = () => {
  return [{ title: `Patreon | Yiffer.xyz` }];
};

export async function loader(args: LoaderFunctionArgs) {
  const patrons = await getPatrons(args.context.cloudflare.env.DB);
  if (patrons.err) {
    return processApiError('Error in /patreon', patrons.err);
  }

  const tiers: { [key: number]: Patron[] } = {};
  for (const patron of patrons.result) {
    const dollars = patron.patreonDollars;
    if (!tiers[dollars]) {
      tiers[dollars] = [patron];
    } else {
      tiers[dollars].push(patron);
    }
  }

  return { patronTiers: tiers };
}

export default function Patreon() {
  const { patronTiers } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto pb-20">
      <h1>Patreon</h1>

      <Breadcrumbs prevRoutes={[]} currentRoute="Patreon" />

      <p>
        The costs of running this website are significant. As of 2024, the total monthly
        sum is around $600, and the income from our hand-made advertising service is not
        enough to cover these expenses. We will not make this site "ugly" by resorting to
        your typical adult site's 3rd party advertising service either. All expenses not
        covered by advertising and Patreon income are paid for out-of-pocket by our owner.
        So if you have a few dollars to spare, please help keep this site alive!
        Additionally, if you have artist/creator/model friends who could use some more
        attention, our advertising service is genuinely quite effective and easy to use.
        Consider telling them about us and sending them to our{' '}
        <Link href="/advertising" text="advertising page" isInsideParagraph />!
      </p>

      <a href="https://www.patreon.com/bePatron?u=61346131">
        <button
          className="shadow-sm bg-[#FF424D] text-white font-semibold 
            py-3 px-8 rounded-full w-fit border-none text-lg flex flex-row 
            mt-4 transition-all duration-100 hover:cursor-pointer 
            hover:bg-[#E63B44] focus:outline-none"
        >
          <svg
            width="25px"
            height="24px"
            viewBox="0 0 256 247"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            preserveAspectRatio="xMidYMid"
            className="mr-2"
          >
            <g>
              <path
                d="M45.1355837,0 L45.1355837,246.35001 L0,246.35001 L0,0 L45.1355837,0 Z M163.657111,0 C214.65668,0 256,41.3433196 256,92.3428889 C256,143.342458 214.65668,184.685778 163.657111,184.685778 C112.657542,184.685778 71.3142222,143.342458 71.3142222,92.3428889 C71.3142222,41.3433196 112.657542,0 163.657111,0 Z"
                fill="#FFF"
              ></path>
            </g>
          </svg>
          Become a patron!
        </button>
      </a>

      <h2 className="mt-6">Rewards</h2>
      <p>
        As a patron, you can link your Patreon account to your Yiffer account on your{' '}
        <Link href="/me/patreon" text="patreon settings page" isInsideParagraph />. After
        doing so, your support will be visible in the list below. Additionally, once we
        implement public user profiles (soon!), your supporter status will display there
        as well. For users in the $5 tier and up, usernames will get a supporter badge
        next to them. We're open to other ideas for patron perks, feel free to share your
        thoughts via our{' '}
        <Link href="/contribute/feedback" isInsideParagraph text="feedback form" />!
      </p>

      <PatronList patronTiers={patronTiers} />
    </div>
  );
}
