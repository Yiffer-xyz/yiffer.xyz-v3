import Breadcrumbs from '~/ui-components/Breadcrumbs/Breadcrumbs';
import Link from '~/ui-components/Link';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import PatronList from './patronList';
import { useLoaderData } from '@remix-run/react';
export { YifferErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction = () => {
  return [{ title: `Patreon | Yiffer.xyz` }];
};

export function loader(args: LoaderFunctionArgs) {
  const { IMAGES_SERVER_URL } = args.context.cloudflare.env;
  return { IMAGES_SERVER_URL };
}

export default function Patreon() {
  const { IMAGES_SERVER_URL } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto pb-20">
      <h1>Patreon</h1>

      <Breadcrumbs prevRoutes={[]} currentRoute="Patreon" />

      <p>
        The costs of running this website are significant. As of 2024, the total monthly
        sum is around $600, and the income from our hand-made advertising service is not
        enough to cover this. We will not make this site "ugly" by resorting to your
        typical adult site's 3rd party advertising service either. All expenses not
        covered by advertising and Patreon income are paid for out-of-pocket by our owner.
        So if you have a few dollars to spare, please help keep this site alive!
        Additionally, if you have artist/creator/model friends who could use some more
        attention, our advertising service is genuinely quite effective and easy to use,
        so consider telling them about us and sending them to our{' '}
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
        We've prioritized getting the new version of this site up and running over syncing
        Patreon subscriber lists for now. Instead, at least once per month, we import the
        list of patrons and display them below. In the near future, we plan to sync this
        automatically, add options for displaying your name and picture (like in the old
        version of the site), and potentially add other perks too. If you have ideas for
        other patron perks, please let us know via our{' '}
        <Link href="/contribute/feedback" isInsideParagraph text="feedback form" />!
      </p>

      <PatronList IMAGES_SERVER_URL={IMAGES_SERVER_URL} />
    </div>
  );
}
