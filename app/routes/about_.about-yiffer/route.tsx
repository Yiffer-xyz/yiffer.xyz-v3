import Breadcrumbs from '~/ui-components/Breadcrumbs/Breadcrumbs';
import ImageCarousel from '~/ui-components/ImageCarousel/ImageCarousel';
import type { MetaFunction } from '@remix-run/cloudflare';
import Button from '~/ui-components/Buttons/Button';
import { useState } from 'react';
import v1Landing1 from '~/assets/about-history/v1/landing-1.jpg';
import v1Landing2 from '~/assets/about-history/v1/landing-2.jpg';
import v1Landing3 from '~/assets/about-history/v1/landing-3.jpg';
import v1Dark from '~/assets/about-history/v1/dark.jpg';
import v1Comic from '~/assets/about-history/v1/comic.png';
import v1Artist from '~/assets/about-history/v1/artist.png';
import v1Rate from '~/assets/about-history/v1/rate.png';
import v1Login from '~/assets/about-history/v1/login.jpg';
import v1Suggest from '~/assets/about-history/v1/suggest.jpg';
import v2MainLight from '~/assets/about-history/v2/main-light.png';
import v2MainDark from '~/assets/about-history/v2/main-dark.png';
import v2CardsLight from '~/assets/about-history/v2/cards.png';
import v2MobileLight from '~/assets/about-history/v2/mobile-light.png';
import v2Comic from '~/assets/about-history/v2/comic.png';
import v2Artist from '~/assets/about-history/v2/artist.png';
import v2Rating from '~/assets/about-history/v2/rating.png';
import v2Account from '~/assets/about-history/v2/account.png';
import v2AdminMain from '~/assets/about-history/v2/admin/admin-main.png';
import v2AdminNewcomic from '~/assets/about-history/v2/admin/admin-newcomic.png';
import v2AdminComicmanager from '~/assets/about-history/v2/admin/admin-comicmanager.png';
import v2AdminPagemanager from '~/assets/about-history/v2/admin/admin-pagemanager.png';
import v2AdminAdd from '~/assets/about-history/v2/admin/admin-add.png';
import v2AdminPending from '~/assets/about-history/v2/admin/admin-pending.png';
import v2AdminSuggestions from '~/assets/about-history/v2/admin/admin-suggestions.png';
import v2AdminTags from '~/assets/about-history/v2/admin/admin-tags.png';
import v2AdminProblems from '~/assets/about-history/v2/admin/admin-problems.png';
import v2AdsDashboard from '~/assets/about-history/v2/ads-dashboard.png';
import v2AdsManager from '~/assets/about-history/v2/ads-manager.png';
import v2Video from '~/assets/about-history/v2/yiffer-v2-modpanel.mp4';

export { YifferErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction = () => {
  return [{ title: `About Yiffer.xyz | Yiffer.xyz` }];
};

export default function AboutPage() {
  const [isV2VideoShown, setIsV2VideoShown] = useState(false);
  // const [isV3VideoShown, setIsV3VideoShown] = useState(false);

  return (
    <div className="container mx-auto pb-8">
      <h1>About Yiffer.xyz</h1>

      <Breadcrumbs
        prevRoutes={[{ href: '/about', text: 'About' }]}
        currentRoute="About Yiffer.xyz"
      />

      <div className="flex flex-col gap-6">
        <h2 className="-mb-5">Content policy</h2>
        <p>
          At Yiffer.xyz we strive to only host content which is publicly available, and we
          will remove any content from artists who ask us to do so. As the primary site
          for furry comics, we believe that artists gain significant amounts of followers
          through our website, as we display links to any profile we can find in the
          artist page. We have a soft quality requirement, meaning that not just any comic
          will be accepted. Censored comics, comics in foreign languages, or poorly drawn
          comics will all be rejected. Underage content is not allowed.
        </p>

        <h2 className="-mb-5">Technology</h2>
        <p>
          The current tech stack is quite an exciting one. We're running fully on the edge
          via Cloudflare. Front and back-ends are written in combination in Remix.js,
          hosted on Cloudflare Pages. This means all page loads are server-side rendered
          at blazing speeds. Our database is Cloudflare D1 SQL, an edge database. File
          storage is Cloudflare R2. Naturally, all of this is served via Cloudflare's CDN.
          This tech stack is a dream to work with!
        </p>
        <p className="-mt-2">
          In addition to the main parts described above, we have a small permanent server
          where image processing happens when things are uploaded, as that's harder to do
          on the edge. This is a simple Express/NodeJS server.
        </p>

        <h2 className="-mb-5">History</h2>
        <p>Yiffer.xyz has had three versions.</p>

        <h4 className="-mb-5">First version: 2016-2020</h4>
        <p>
          The first version was a simple site build with Angular.js (v1.6), with api
          (Express/NodeJS), database (MySQL) and file storage all hosted on a single VM,
          without containers or redundancy. Not very reliable, these decisions were result
          of the site being a side project where the developer was "learning by doing",
          not having any prior web dev experience.
        </p>

        <ImageCarousel
          title="Screenshots from v1"
          description="Unfortunately, no screenshots of the mod panel were saved."
          height={340}
          images={[
            { source: v1Landing1, description: 'V1 landing page' },
            { source: v1Landing2, description: 'Small card version' },
            { source: v1Landing3, description: 'Large card, logged in version' },
            { source: v1Dark, description: 'Dark mode was pure black' },
            { source: v1Comic, description: 'Comic page' },
            { source: v1Artist, description: 'Artist page' },
            { source: v1Login, description: 'Login pop-up' },
            { source: v1Rate, description: 'Rating a comic' },
            { source: v1Suggest, description: 'Very simple comic suggestion form' },
          ]}
        />

        <h4 className="-mb-5">Second version: 2020-2025</h4>
        <p>
          The second version was a complete rewrite, and included more features. Our
          advertising system was introduced here, and the mod panel was massively
          extended. This version also included a change in visual profile, going from
          gray-and-pink to something very close to today's version, with green and blue
          hues.
        </p>
        <p>
          This front-end was built with Vue.js (Vue 2), with the api still Express/NodeJS
          and database still MySQL, but now hosted on Google Cloud. File storage was moved
          to Google Cloud too. Moreover, the site was containerized via Docker, and the
          front-end was split into three parts each hosted as their own web app via
          subdomains: The main site, the advertising part, and the mod panel.
        </p>

        <ImageCarousel
          title="Screenshots from v2"
          height={340}
          images={[
            { source: v2MainLight, description: 'Main site, light mode' },
            {
              source: v2MainDark,
              description: 'Main site, dark mode, showcasing search/filtering',
            },
            { source: v2CardsLight, description: 'Cards view' },
            { source: v2MobileLight, description: 'Mobile view' },
            { source: v2Comic, description: 'Comic page' },
            { source: v2Artist, description: 'Artist page' },
            { source: v2Rating, description: 'Rating a comic' },
            { source: v2Account, description: 'Account page' },
            {
              source: v2AdminMain,
              description:
                'Mod panel, landing page. The expandable box design was not very practical when jumping between different tasks. Half of the mod panel was not mobile-friendly. See the video below for a quick demo.',
            },
            {
              source: v2AdminNewcomic,
              description:
                'Mod panel, adding a new comic. No function for reordering pages, files needed to be alphabetically sorted prior to upload.',
            },
            {
              source: v2AdminComicmanager,
              description: 'Mod panel, managing basic comic info',
            },
            {
              source: v2AdminPagemanager,
              description:
                'Mod panel, managing pages - annoyingly separate from comic manager',
            },
            {
              source: v2AdminAdd,
              description:
                'Mod panel, adding new pages - again, separate from comic manager',
            },
            {
              source: v2AdminPending,
              description: 'Mod panel, handling pending comics before publication',
            },
            {
              source: v2AdminSuggestions,
              description: 'Mod panel, handling comic suggestions from users',
            },
            {
              source: v2AdminTags,
              description: 'Mod panel, managing tag suggestions',
            },
            {
              source: v2AdminProblems,
              description: 'Mod panel, handling comic problems reported by users',
            },
            {
              source: v2AdsDashboard,
              description: 'Advertising dashboard',
            },
            {
              source: v2AdsManager,
              description: 'Managing an ad',
            },
          ]}
        />

        <div>
          <p>
            <b>V2 Mod panel video demo</b>
          </p>
          {!isV2VideoShown && (
            <>
              <p>
                Click the button to load a quick video demo of this version's mod panel!
              </p>

              <Button
                text="Show mod panel video"
                className="mt-1"
                onClick={() => setIsV2VideoShown(true)}
              />
            </>
          )}

          {isV2VideoShown && (
            <div>
              <p>
                The expandable box design was not very practical when jumping between
                different tasks. Many things you'd typically do together were in entirely
                separate boxes. Half of the mod panel was not mobile-friendly, and even in
                desktop mode the horizontal scrolling was annoying. Usable, but far from
                ideal.
              </p>
              <video src={v2Video} controls className="mt-1" />
            </div>
          )}
        </div>

        <h4 className="-mb-5">Third version: 2025-present</h4>
        <p>
          The third version is once again a complete rewrite, with the tech stack
          described above. New in v3 is the whole contributions system; previously, the
          only option for contributing by users was to suggest comics via name+links, and
          to suggest tag changes to comics - only a tiny part of how users can contribute
          today. A new minimal landing page was introduced to make helpful links easier to
          spot, instead of going directly to the comic browse page of previous versions.
          V3 also introduced a new rating system, going from ratings of 1-10, to 1-3
          stars. The reasoning behind this is that most people either rated things 8, 9,
          10, or 1. Bookmarking comics was also introduced in v3. Once again the mod panel
          was upgraded, from usable to delightful and <i>powerful</i>. About two thirds of
          development time has gone into the mod panel, because in the end, mods are the
          backbone of this site.
        </p>
        <p>
          The reason for this rewrite was to make further development as enjoyable and
          rapid as possible with brand new scalable technology. It also to cuts costs, as
          Google Cloud Platform (and all competitors such as AWS and Azure) is expensive.
        </p>

        <div>
          <p>
            <b>V3 Mod panel video demo</b>
          </p>
          {/* {!isV3VideoShown && ( */}
          <>
            <p>
              A video of the new mod panel will be added here once the site has been live
              for a bit, to showcase it with real data.
            </p>
            {/* <p>
                Click the button to load a quick video demo of this version's mod panel!
              </p>

              <Button
                text="Show mod panel video"
                className="mt-1"
                onClick={() => setIsV3VideoShown(true)}
              /> */}
          </>
          {/* )} */}

          {/* {isV3VideoShown && (
            <div>
              <p>Description</p>
              <video src={v3Video} controls className="mt-1" />
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
}
