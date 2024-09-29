import Breadcrumbs from '~/ui-components/Breadcrumbs/Breadcrumbs';
export { YifferErrorBoundary as ErrorBoundary } from '~/utils/error';

export default function Patreon() {
  return (
    <div className="container mx-auto">
      <h1>Patreon</h1>

      <Breadcrumbs prevRoutes={[{ text: 'Me', href: '/me' }]} currentRoute="Patreon" />

      <p>TODO implement</p>
    </div>
  );
}
