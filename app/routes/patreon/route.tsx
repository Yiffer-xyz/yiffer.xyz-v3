import Breadcrumbs from '~/ui-components/Breadcrumbs/Breadcrumbs';
import Link from '~/ui-components/Link';
export { YifferErrorBoundary as ErrorBoundary } from '~/utils/error';

export default function Patreon() {
  return (
    <div className="container mx-auto pb-20">
      <h1>Patreon</h1>

      <Breadcrumbs prevRoutes={[{ text: 'Me', href: '/me' }]} currentRoute="Patreon" />

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
        <Link href="/advertising" text="advertising page" />!
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

      <h3 className="mt-6">Rewards</h3>
      <p>
        We've prioritized getting the new version of this site up and running over syncing
        Patreon subscriber lists for now, so there are no immediate rewards yet. In the
        near future, however, we plan to display a list of all patron users on our site to
        show gratitude ❤️. If you have ideas for other patron perks, please let us know
        via our{' '}
        <Link href="/contribute/feedback" isInsideParagraph text="feedback form" />!
      </p>
    </div>
  );
}
