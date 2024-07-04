import Breadcrumbs from '~/ui-components/Breadcrumbs/Breadcrumbs';

export default function AboutPage() {
  return (
    <div className="container mx-auto pb-8">
      <h1>About</h1>

      <Breadcrumbs prevRoutes={[]} currentRoute="About" />

      <p>TODO: Implement :)</p>
    </div>
  );
}
