import Breadcrumbs from '~/ui-components/Breadcrumbs/Breadcrumbs';
export { YifferErrorBoundary as ErrorBoundary } from '~/utils/error';

export default function PrivacyPage() {
  return (
    <div className="container mx-auto pb-8">
      <h1>Privacy & Terms of Use</h1>

      <Breadcrumbs
        prevRoutes={[{ href: '/about', text: 'About' }]}
        currentRoute="Privacy & Terms of Use"
      />

      <p>Ok privacy</p>
    </div>
  );
}
