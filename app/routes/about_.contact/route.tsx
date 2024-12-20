import Breadcrumbs from '~/ui-components/Breadcrumbs/Breadcrumbs';
import Link from '~/ui-components/Link';
import type { MetaFunction } from '@remix-run/cloudflare';
export { YifferErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction = () => {
  return [{ title: `Contact & takedowns | Yiffer.xyz` }];
};

export default function ContactPage() {
  return (
    <div className="container mx-auto pb-8">
      <h1>Contact & takedowns</h1>

      <Breadcrumbs
        prevRoutes={[{ href: '/about', text: 'About' }]}
        currentRoute="Contact & takedowns"
      />

      <div className="flex flex-col gap-6">
        <p>
          If you need assistance with the site or have other general inquiries, please
          reach out{' '}
          <Link
            href="/contribute/feedback"
            text="here"
            isInsideParagraph
            showRightArrow
          />
          . If you do not have an account and don't wish to create one, you can submit
          inquiries via contact@yiffer.xyz.
        </p>

        <p>
          If you are an artist and want your content taken down, we will comply with your
          wishes. Contact us via contact@yiffer.xyz and provide proof of ownership and
          we'll get back to you quickly.
        </p>
        <p>
          In the future, we plan to let artists take control of their own comics if they
          wish to, and publish updates themselves. Are you an artist who's interested in
          this feature? Let us know! This is on our roadmap already, but if people show
          interest, we might get to it quicker than intially planned.
        </p>
      </div>
    </div>
  );
}
