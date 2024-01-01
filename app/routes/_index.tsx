import { RiArrowRightLine } from 'react-icons/ri';
import Link from '~/ui-components/Link';
import useWindowSize from '~/utils/useWindowSize';
import { Link as RemixLink } from '@remix-run/react';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import type { Blog } from '~/types/types';

export default function Index() {
  const { isMobile } = useWindowSize();

  const { data: latestBlog } = useGoodFetcher<Blog>({
    url: '/api/latest-blog',
    fetchGetOnLoad: true,
  });

  return (
    <div className="pb-8">
      <h1
        className="text-center mt-12"
        style={{ fontFamily: 'Shrikhand,cursive', fontSize: isMobile ? '3rem' : '4rem' }}
      >
        Yiffer.xyz
      </h1>

      <p className="text-lg text-center">
        The internet's best collection <br className="block sm:hidden" />
        of quality furry comics
      </p>

      <div className="max-w-xs flex flex-col mx-auto mt-4 gap-4">
        <div className="bg-theme1-primaryTrans rounded-sm h-[90px] flex flex-col items-center justify-center">
          <p className="text-center">
            We are struggling financially.
            <br />
            Please <Link text="support us on Patreon" href="#" />!
          </p>
          <p className="text-center mt-0.5">VIP patron: TODO implement.</p>
        </div>

        <RemixLink to="/browse" className={`w-full`}>
          <div
            className={`h-14 bg-gradient-to-r from-theme1-darker to-theme2-darker text-text-light
            rounded-sm flex flex-row justify-center items-center gap-1 shadow-md`}
          >
            <p className="font-semibold text-white">Browse comics</p>
            <RiArrowRightLine style={{ marginTop: 3 }} className="text-white" />
          </div>
        </RemixLink>

        <RemixLink to="/account" className="w-full mb-2">
          <div
            className={`h-14 bg-theme1-primaryTrans
            rounded-sm flex flex-row justify-center items-center gap-1 shadow-md`}
          >
            <p>My account and profile</p>
            <RiArrowRightLine style={{ marginTop: 3 }} />
          </div>
        </RemixLink>

        <Link
          href="https://pi.yiffer.xyz"
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
          href={latestBlog ? `/blog/${latestBlog.id}` : '#'}
          text={`Latest blog: ${latestBlog?.title ?? ''}`}
          IconRight={latestBlog ? RiArrowRightLine : undefined}
        />
      </div>
    </div>
  );
}
