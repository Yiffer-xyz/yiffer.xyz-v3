import {
  unstable_defineLoader,
  type LinksFunction,
  type MetaFunction,
} from '@remix-run/cloudflare';
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react';
import { UIPrefProvider, useUIPreferences } from './utils/theme-provider';
import clsx from 'clsx';
import toastCss from 'react-toastify/dist/ReactToastify.css?url';
import { getUIPrefSession } from './utils/theme.server';
import {
  RiAccountCircleLine,
  RiAddLine,
  RiLoginBoxLine,
  RiSettings3Line,
} from 'react-icons/ri';
import { MdLightbulbOutline } from 'react-icons/md';
import Link from './ui-components/Link';
import { ToastContainer } from 'react-toastify';
import type { UserSession } from './types/types';
import './tailwind.css';
import './main.css';
import { getUserSession } from './utils/auth.server';

// import * as Sentry from '@sentry/browser';

// Sentry.init({
//   dsn: 'https://74fe377e56b149fa9f1fa9d41d5de90b@o4504978928959488.ingest.sentry.io/4504978941542400',
//   integrations: [new Sentry.BrowserTracing()],
//   // Alternatively, use `process.env.npm_package_version` for a dynamic release version
//   // if your build tool supports it.
//   // Set tracesSampleRate to 1.0 to capture 100%
//   // of transactions for performance monitoring.
//   // We recommend adjusting this value in production
//   tracesSampleRate: 1.0,
// });

export const links: LinksFunction = () => [
  {
    rel: 'icon',
    href: 'favicon.png',
    type: 'image/png',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Mulish:wght@300;600&display=swap',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Shrikhand&text=Yiffer.xyz&display=swap',
  },
  { rel: 'stylesheet', href: toastCss },
];

const isDev = process.env.NODE_ENV === 'development';

export const meta: MetaFunction = () => [
  { title: `${isDev ? '🚧dev ' : ''}Yiffer.xyz` },
  { property: 'og:title', content: `${isDev ? '🚧dev ' : ''}Yiffer.xyz` },
  { name: 'description', content: 'This Yiffer yoffer yiffer' },
];

export const loader = unstable_defineLoader(async ({ request, context }) => {
  const uiPrefSession = await getUIPrefSession(request);
  const userSession = await getUserSession(
    request,
    context.cloudflare.env.JWT_CONFIG_STR
  );

  const data = {
    uiPref: uiPrefSession.getUiPref(),
    user: userSession,
    frontPageUrl: context.cloudflare.env.FRONT_PAGE_URL,
  };
  return data;
});

export default function AppWithProviders() {
  const data = useLoaderData<typeof loader>();

  return (
    <UIPrefProvider specifiedUIPref={data.uiPref}>
      <App />
    </UIPrefProvider>
  );
}

function App() {
  const { theme } = useUIPreferences();
  const data = useLoaderData<typeof loader>();

  return (
    <html lang="en" className={clsx(theme)}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="dark:bg-bgDark text-text-light dark:text-text-dark">
        <Layout frontPageUrl={data.frontPageUrl} user={data.user}>
          <Outlet />
        </Layout>
        <ScrollRestoration />
        <ToastContainer />
        <Scripts />
      </body>
    </html>
  );
}

function Layout({
  frontPageUrl,
  user,
  children,
}: {
  frontPageUrl: string;
  user: UserSession | null;
  children: React.ReactNode;
}) {
  const { theme, setTheme } = useUIPreferences();

  const isLoggedIn = !!user;
  const isMod = user?.userType === 'admin' || user?.userType === 'moderator';
  const darkNavLinkColorStyle = 'dark:text-blue-strong-300';
  const navLinkStyle = `text-gray-200 font-semibold bg-none text-sm ${darkNavLinkColorStyle}`;

  return (
    <>
      <nav
        className="flex bg-gradient-to-r from-theme1-primary to-theme2-primary dark:bg-none
          px-4 py-1.5 nav-shadowing justify-between mb-4 text-gray-200 w-full z-20"
      >
        <div className="flex items-center justify-between mx-auto flex-grow max-w-full lg:max-w-80p">
          <div className="flex gap-3 sm:gap-5 items-center">
            <a
              href={frontPageUrl}
              className={`text-gray-200 hidden lg:block bg-none mr-1 ${darkNavLinkColorStyle}`}
              style={{
                fontFamily: 'Shrikhand,cursive',
                fontSize: '1.25rem',
                fontWeight: 400,
              }}
            >
              Yiffer.xyz
            </a>
            <a
              href={frontPageUrl}
              className={`text-gray-200 block lg:hidden bg-none mr-1 ${darkNavLinkColorStyle}`}
              style={{
                fontFamily: 'Shrikhand,cursive',
                fontSize: '1.25rem',
                fontWeight: 400,
              }}
            >
              Y
            </a>
            <>
              {isLoggedIn && (
                <Link
                  href="/me"
                  className={navLinkStyle}
                  iconMargin={2}
                  text="Me"
                  Icon={RiAccountCircleLine}
                />
              )}
              {isLoggedIn && isMod && (
                <Link
                  href="/admin"
                  className={navLinkStyle}
                  iconMargin={2}
                  text="Mod"
                  Icon={RiSettings3Line}
                />
              )}
              <Link
                href="/contribute"
                className={`${navLinkStyle} -ml-1`}
                iconMargin={2}
                text="Contribute"
                Icon={RiAddLine}
              />
            </>
            {!isLoggedIn && (
              <a href="/login" className={navLinkStyle}>
                <RiLoginBoxLine className="inline-block" />
                Log in
              </a>
            )}
          </div>

          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="text-gray-200 cursor-pointer dark:text-blue-strong-300"
          >
            <MdLightbulbOutline className="mb-1" />
          </button>
        </div>
      </nav>

      {children}
    </>
  );
}
