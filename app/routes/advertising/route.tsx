import { unstable_defineLoader } from '@remix-run/cloudflare';
import Breadcrumbs from '~/ui-components/Breadcrumbs/Breadcrumbs';
import LinkCard from '~/ui-components/LinkCard/LinkCard';

export const loader = unstable_defineLoader(async args => {
  return {};
});

export default function Advertising() {
  return (
    <div className="container mx-auto">
      <h1>Advertising</h1>

      <Breadcrumbs
        prevRoutes={[{ text: 'Me', href: '/me' }]}
        currentRoute="Advertising"
      />

      <div className="flex flex-row flex-wrap gap-4 mt-4">
        <LinkCard
          href="/advertising/dashboard"
          title="Advertising dashboard"
          includeRightArrow
        />

        <LinkCard
          href="/advertising/apply"
          title="Apply for advertisement"
          includeRightArrow
        />
      </div>

      <p className="mt-32">
        Text text text Text text text Text text text Text text text Text text text Text
        tet text xt Text text text Text text text
      </p>
      <p>
        Text text text Text text text Text text text Text text text Text text text Text
        text text Text text text Text text text Text text text
      </p>
      <p>
        Text text text Text text text Text text text Text text text Text text text Text
        text text Te text text Text text text
      </p>
      <p>
        Text text text Text text text Text text text Text text text Text text text Text
        text text Text text text Text text text Text text text
      </p>
    </div>
  );
}
