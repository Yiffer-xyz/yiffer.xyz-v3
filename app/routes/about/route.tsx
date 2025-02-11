import Breadcrumbs from '~/ui-components/Breadcrumbs/Breadcrumbs';
import LinkCard from '~/ui-components/LinkCard/LinkCard';
import type { MetaFunction } from '@remix-run/cloudflare';
export { YifferErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction = () => {
  return [{ title: `About | Yiffer.xyz` }];
};

export default function AboutPage() {
  return (
    <div className="container mx-auto pb-8">
      <h1>About</h1>

      <Breadcrumbs prevRoutes={[]} currentRoute="About" />

      <div className="mt flex flex-col gap-4 mt-2 sm:mt-4 w-fit">
        <LinkCard
          title="About Yiffer.xyz"
          description="Learn more about the site, how it works, and its history and future."
          href="/about/about-yiffer"
          className="h-full sm:max-w-[440px]"
          includeRightArrow
        />
        <LinkCard
          title="Contact and takedowns"
          description="Contact us or request a takedown of your content as an artist."
          href="/about/contact"
          className="h-full sm:max-w-[440px]"
          includeRightArrow
        />
        <LinkCard
          title="Changelog"
          description="See what we're doing to improve the site."
          href="/about/changelog"
          className="h-full sm:max-w-[440px]"
          includeRightArrow
        />
        <LinkCard
          title="Privacy Policy and Terms of Use"
          description="The boring yet necessary details."
          href="/about/privacy"
          className="h-full sm:max-w-[440px]"
          includeRightArrow
        />
      </div>
    </div>
  );
}
