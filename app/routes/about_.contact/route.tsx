import Breadcrumbs from '~/ui-components/Breadcrumbs/Breadcrumbs';
import Link from '~/ui-components/Link';
export { YifferErrorBoundary as ErrorBoundary } from '~/utils/error';

export default function ContactPage() {
  return (
    <div className="container mx-auto pb-8">
      <h1>Contact & takedowns</h1>

      <Breadcrumbs
        prevRoutes={[{ href: '/about', text: 'About' }]}
        currentRoute="Contact & takedowns"
      />

      <p>
        If you need assistance with the site or have other general inquiries, please reach
        out{' '}
        <Link href="/contribute/feedback" text="here" isInsideParagraph showRightArrow />.
      </p>

      <p className="mt-4">If you are an artist and asdasdasd</p>
    </div>
  );
}
