import Breadcrumbs from '~/ui-components/Breadcrumbs/Breadcrumbs';
import type { MetaFunction } from '@remix-run/cloudflare';
export { YifferErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction = () => {
  return [{ title: `Privacy & Terms of Use | Yiffer.xyz` }];
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto pb-8">
      <h1>Privacy & Terms of Use</h1>

      <Breadcrumbs
        prevRoutes={[{ href: '/about', text: 'About' }]}
        currentRoute="Privacy & Terms of Use"
      />

      <div className="flex flex-col gap-6">
        <h2 className="-mb-5">Privacy policy</h2>
        <p>
          Yiffer.xyz collects visitor data and analyzes traffic on our site. This
          information helps us understand customer interests and helps us improve our
          website. When you visit our site, the pages that you look at, and a short text
          file called a cookie, are downloaded to your computer. A cookie is used to store
          small amounts of information. This information is collected both for traffic
          analysis and to improve your experience by remembering certain choices you make
          regarding color themes and search settings. The cookie does not contain personal
          details. We do not sell, give, or trade the statistics we store to any 3rd
          parties for data-mining or marketing purposes. We also use Google Analytics to
          get visitor statistics - please see
          https://policies.google.com/technologies/partner-sites for more information on
          how Google uses cookies to process and collect data.
        </p>
        <p>
          When you create an account at Yiffer.xyz, your email is connected to this
          account and stored on our website. This is purely to enable password resets in
          case you forget your password. Additionally, if you apply as an advertiser, you
          might receive emails regarding your active adverts.
        </p>

        <h2 className="-mb-5">Terms of Use </h2>
        <p>
          By using this site, you represent and warrant that: (1) you have the legal
          capacity and you agree to comply with these Terms of Use; (2) you are above 18
          years of age; (3) you will not access the site through automated or non-human
          means unless granted permission to do so; (4) you will not use the site for any
          illegal or unauthorized purpose; (5) your use of the sute will not violate any
          applicable law or regulation.
        </p>
        <p>
          Yiffer.xyz is not responsible for any other websites that are linked to from our
          site.
        </p>
        <p>
          Most content management on Yiffer.xyz is handled by moderators. This includes
          all uploads of artwork, all managing of comic and artist information, as well as
          handling most types of feedback submitted by users. Some more important data is
          handled by the site's admins. This includes "feedback" submitted by users, as
          well as all advertising management.
        </p>
        <p>
          By creating an account on Yiffer.xyz you accept responsibility that your account
          is not used by unauthorized parties, and that any action made by your account
          comply with these terms. Should you use your account in any way that does not
          comply with these terms, or to repeatedly provide incorrect suggestions to the
          moderator team, Yiffer.xyz may decide to terminate your account.
        </p>
        <p>
          Yiffer.xyz does not own the rights to any artwork displayed on the website. All
          artwork is submitted by moderators, who, to the best of their ability, will only
          submit artwork that is publicly available. Moderators are instructed to always
          provide as many links to the original artists as possible. Should an artist wish
          some of their artwork to be taken down, they may contact us via email at
          contact@yiffer.xyz, and we will comply.
        </p>
        <p>
          Users that have the possibility to upload artwork are prohibited from uploading
          artwork that is intended to be paid for, or that is otherwise not available for
          free online.
        </p>
      </div>
    </div>
  );
}
