import Breadcrumbs from '~/ui-components/Breadcrumbs/Breadcrumbs';
import type { MetaFunction } from '@remix-run/cloudflare';
export { YifferErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction = () => {
  return [{ title: `Changelog | Yiffer.xyz` }];
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto pb-8">
      <h1>Changelog</h1>

      <Breadcrumbs
        prevRoutes={[{ href: '/about', text: 'About' }]}
        currentRoute="Changelog"
      />

      <p className="mt-2">
        Here's a list of notable changes since this version of the site went live in early
        Feb 2025. There's a lot more going on, but not everything's worth mentioning.
      </p>

      <div className="flex flex-col gap-6 mt-4">
        <ChangelogItem
          date="2025-02-12"
          texts={[
            'Stopped being case sensitive when checking usernames/emails (login, signup, password resets, etc.)',
          ]}
        />
        <ChangelogItem
          date="2025-02-11"
          texts={[
            'Fixed email changing not working.',
            'Fixed incorrect sum of user stars on comics viewed from an artist page.',
          ]}
        />
        <ChangelogItem
          date="2025-02-10"
          texts={[
            'Added this changelog page!',
            'Require setting an email for old accounts without one.',
            'Added change email functionality.',
          ]}
        />
        <ChangelogItem
          date="2025-02-09"
          texts={[
            'Fixed ordering comics by user score.',
            'Fixed favicon not showing up on some pages.',
            'Made mod panel page manager more mobile friendly.',
          ]}
        />
        <ChangelogItem
          date="2025-02-08"
          texts={['Implemented more advanced file handling in the mod panel.']}
        />
        <ChangelogItem
          date="2025-02-06"
          texts={[
            'Fixed filtering by bookmarked comics only.',
            'Made the artist page faster.',
          ]}
        />
        <ChangelogItem
          date="2025-02-04"
          texts={[
            'Added order by file name option to comic uploader.',
            'Improved mod panel speed of adding pages to a comic.',
          ]}
        />
      </div>
    </div>
  );
}

function ChangelogItem({ date, texts }: { date: string; texts: string[] }) {
  return (
    <div>
      <p className="font-bold">{date}</p>
      {texts.map(text => (
        <p key={text}>{text}</p>
      ))}
    </div>
  );
}
