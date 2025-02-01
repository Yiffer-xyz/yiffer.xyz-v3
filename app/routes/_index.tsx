import { RiArrowRightLine } from 'react-icons/ri';
import Link from '~/ui-components/Link';
import { Link as RemixLink, useLoaderData } from '@remix-run/react';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import type { Blog } from '~/types/types';
import { useUIPreferences } from '~/utils/theme-provider';
import { authLoader } from '~/utils/loaders';
import { colors } from 'tailwind.config';
import { useEffect } from 'react';
import posthog from 'posthog-js';
export { YifferErrorBoundary as ErrorBoundary } from '~/utils/error';

export { authLoader as loader };

export default function Index() {
  const { theme } = useUIPreferences();
  const userSession = useLoaderData<typeof authLoader>();

  const { data: latestBlog } = useGoodFetcher<Blog>({
    url: '/api/latest-blog',
    fetchGetOnLoad: true,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.shouldCaptureUser && userSession) {
        window.shouldCaptureUser = false;
        posthog.identify(userSession.userId.toString(), {
          username: userSession.username,
        });
      }
    }
  }, [userSession]);

  return (
    <div className="pb-8">
      <h1
        className="text-center mt-12 dark:text-transparent dark:bg-clip-text w-fit mx-auto text-[57px] md:text-[72px]"
        style={{
          fontFamily: 'Shrikhand,cursive',
          ...(theme === 'dark' ? darkHeaderStyle : lightHeaderStyle),
        }}
      >
        Yiffer.xyz
      </h1>

      <p className="text-lg md:text-xl text-center md:mb-6 md:mt-2">
        The internet's best collection <br className="block sm:hidden" />
        of quality furry comics
      </p>

      <div className="max-w-xs flex flex-col mx-auto mt-4 gap-4">
        <div className="bg-theme1-primaryTrans rounded h-[90px] flex flex-col items-center justify-center">
          <p className="text-center">
            We are struggling financially.
            <br />
            Please read more and <b>go ad-free</b> by <br />
            <Link text="supporting us on Patreon" href="/patreon" isInsideParagraph />!
          </p>
        </div>

        <RemixLink to="/browse" className={`w-full`}>
          <div
            className={`h-12 bg-gradient-to-r from-theme1-darker to-theme2-darker text-text-light
            hover:from-theme1-darker2 hover:to-theme2-darker2
            dark:from-theme1-darker2 dark:to-theme2-darker2
            dark:hover:from-theme1-darker3 dark:hover:to-theme2-darker3
            rounded flex flex-row justify-center items-center gap-1 shadow-md`}
          >
            <p className="font-semibold text-white">Browse comics</p>
            <RiArrowRightLine style={{ marginTop: 3 }} className="text-white" />
          </div>
        </RemixLink>

        <RemixLink to={userSession ? '/me' : 'login'} className="w-full mb-2">
          <div
            className={`h-12 bg-theme1-primaryTrans hover:bg-theme1-primaryTransDarker
            rounded flex flex-row justify-center items-center gap-1 shadow-md`}
          >
            {userSession ? <p>My account and profile</p> : <p>Log in or sign up</p>}
            <RiArrowRightLine style={{ marginTop: 3 }} />
          </div>
        </RemixLink>

        <Link
          href="/advertising"
          text="Advertise on Yiffer.xyz"
          IconRight={RiArrowRightLine}
        />

        <Link
          href="/contribute/join-us"
          text="Become a mod"
          IconRight={RiArrowRightLine}
        />

        <Link
          href="/contribute"
          text="Contribute: Upload or suggest comics"
          IconRight={RiArrowRightLine}
        />

        <Link
          href={latestBlog ? `/blogs/${latestBlog.id}` : '#'}
          text={`Latest blog: ${latestBlog?.title ?? ''}`}
          IconRight={latestBlog ? RiArrowRightLine : undefined}
        />

        <Link href="/about" text="About Yiffer.xyz" IconRight={RiArrowRightLine} />
      </div>
    </div>
  );
}

const darkHeaderStyle = {
  backgroundImage: `-webkit-gradient(linear,left top,right top,color-stop(.2,${colors.theme1.dark}),color-stop(.8,${colors.theme2.dark}))`,
  backgroundClip: 'text',
};
const lightHeaderStyle = {
  color: '#0d0f35',
};
