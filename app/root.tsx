import { captureRemixErrorBoundaryError, withSentry } from '@sentry/remix';
import type {
  LoaderFunctionArgs,
  LinksFunction,
  MetaFunction,
} from '@remix-run/cloudflare';
import {
  Link as RemixLink,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useMatches,
  useNavigation,
  useRouteError,
  useLocation,
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
import { YifferErrorBoundary } from './utils/error';
import { useEffect, useMemo } from 'react';
import posthog from 'posthog-js';
import * as gtag from './utils/gtag.client';
import { useAuthRedirect } from './utils/general';
import { getUserById } from './route-funcs/get-user';
import { processApiError } from './utils/request-helpers';

export const links: LinksFunction = () => [
  {
    rel: 'icon',
    href: '/favicon.png',
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
  { title: `${isDev ? '🚧' : ''}Yiffer.xyz` },
  { property: 'og:title', content: `${isDev ? '🚧' : ''}Yiffer.xyz` },
  { name: 'description', content: 'This Yiffer yoffer yiffer' },
];

export async function loader({ request, context }: LoaderFunctionArgs) {
  const uiPrefSession = await getUIPrefSession(request);

  const userSession = await getUserSession(
    request,
    context.cloudflare.env.JWT_CONFIG_STR
  );

  let isMissingEmail = !!(userSession && !userSession.email);

  // Double check by fetching from db, not just the cookie.
  if (isMissingEmail && userSession?.userId) {
    const userRes = await getUserById(context.cloudflare.env.DB, userSession?.userId);
    if (userRes.err) return processApiError('Error in root', userRes.err);
    if (userRes.result.email) {
      isMissingEmail = false;
    }
  }

  const gaTrackingId = context.cloudflare.env.GA_TRACKING_ID;

  const data = {
    uiPref: uiPrefSession.getUiPref(),
    user: userSession,
    gaTrackingId,
    posthogApiKey: context.cloudflare.env.POSTHOG_API_KEY,
    posthogHost: context.cloudflare.env.POSTHOG_HOST,
    isMissingEmail,
  };

  return data;
}

function AppWithProviders() {
  const data = useLoaderData<typeof loader>();

  return (
    <UIPrefProvider specifiedUIPref={data.uiPref}>
      <App />
    </UIPrefProvider>
  );
}

export default withSentry(AppWithProviders);

function App() {
  const { theme } = useUIPreferences();
  const navigation = useNavigation();
  const isLoading = navigation.state !== 'idle';
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <PosthogInit
        apiKey={data.posthogApiKey}
        host={data.posthogHost}
        userSession={data.user}
      />

      <html lang="en" className={clsx(theme)}>
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <Meta />
          <Links />
        </head>
        <body
          className={`dark:bg-bgDark text-text-light dark:text-text-dark ${
            isLoading ? 'opacity-70 dark:opacity-80' : ''
          }`}
        >
          {!data.gaTrackingId ? null : (
            <>
              <script
                async
                src={`https://www.googletagmanager.com/gtag/js?id=${data.gaTrackingId}`}
              />
              <script
                async
                id="gtag-init"
                dangerouslySetInnerHTML={{
                  __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());

                gtag('config', '${data.gaTrackingId}', {
                  page_path: window.location.pathname,
                });
              `,
                }}
              />
            </>
          )}

          <Layout
            user={data.user}
            gaTrackingId={data.gaTrackingId}
            isMissingEmail={data.isMissingEmail}
          >
            <Outlet />
          </Layout>
          <ScrollRestoration />
          <ToastContainer />
          <Scripts />
        </body>
      </html>
    </>
  );
}

function Layout({
  user,
  excludeLogin = false,
  gaTrackingId,
  isMissingEmail,
  children,
}: {
  user: UserSession | null;
  excludeLogin?: boolean;
  gaTrackingId?: string;
  isMissingEmail?: boolean;
  children: React.ReactNode;
}) {
  const { theme, setTheme } = useUIPreferences();
  const matches = useMatches();
  const location = useLocation();

  useEffect(() => {
    if (gaTrackingId?.length) {
      gtag.pageview(location.pathname, gaTrackingId);
    }
  }, [location, gaTrackingId]);

  const isLoggedIn = !!user;
  const isMod = user?.userType === 'admin' || user?.userType === 'moderator';
  const darkNavLinkColorStyle = 'dark:text-blue-strong-300';
  const navLinkStyle = `text-gray-200 font-semibold bg-none text-sm ${darkNavLinkColorStyle}`;

  const isInAdminDashboard = useMemo(() => {
    return matches.some(
      match => match.pathname.includes('/admin/') || match.pathname.endsWith('/admin')
    );
  }, [matches]);

  const { redirectSetOnLoginNavStr } = useAuthRedirect();

  return (
    <>
      {isMissingEmail && <ForceSetEmail />}

      <nav
        className={`flex bg-gradient-to-r from-theme1-primary to-theme2-primary dark:from-bgDark dark:to-bgDark
          px-4 py-1.5 nav-shadowing justify-between mb-4 text-gray-200 w-full z-20
          ${isInAdminDashboard ? 'fixed lg:dark:border-b-3 lg:dark:border-b-gray-400' : ''}`}
      >
        <div className="flex items-center justify-between mx-auto flex-grow max-w-full lg:max-w-80p">
          <div className="flex gap-3 sm:gap-5 items-center">
            <RemixLink
              to="/"
              className={`text-gray-200 hidden lg:block bg-none mr-1 ${darkNavLinkColorStyle}`}
              style={{
                fontFamily: 'Shrikhand,cursive',
                fontSize: '1.25rem',
                fontWeight: 400,
              }}
            >
              Yiffer.xyz
            </RemixLink>
            <RemixLink
              to="/"
              className={`text-gray-200 block lg:hidden bg-none mr-1 ${darkNavLinkColorStyle}`}
              style={{
                fontFamily: 'Shrikhand,cursive',
                fontSize: '1.25rem',
                fontWeight: 400,
              }}
            >
              Y
            </RemixLink>
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
            {!isLoggedIn && !excludeLogin && (
              <RemixLink
                to={`/login${redirectSetOnLoginNavStr}`}
                className={navLinkStyle}
              >
                <RiLoginBoxLine className="inline-block" />
                Log in
              </RemixLink>
            )}
          </div>

          <button
            onClick={() => {
              const newTheme = theme === 'light' ? 'dark' : 'light';
              setTheme(newTheme);
              posthog.capture('Color theme changed', { theme: newTheme });
            }}
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

export function ForceSetEmail() {
  const matches = useMatches();
  const isOnAccountPage = useMemo(() => {
    return matches.some(
      match => match.pathname.includes('/me') || match.pathname.includes('change-email')
    );
  }, [matches]);

  useEffect(() => {
    posthog.capture('Force email page viewed');
  }, []);

  if (isOnAccountPage) return null;

  return (
    <div className="p-8 fixed top-0 left-0 w-full h-[100vh] flex items-center justify-center bg-white dark:bg-bgDark z-50">
      <div className="flex flex-col gap-2">
        <h2>Missing email</h2>
        <p>Your account needs an associated email address.</p>
        <p>Emails have been required for new accounts since 2021.</p>
        <p>
          We do not send any spam - all you need to do is add an email and click the sent
          verification link.
        </p>
        <p>Follow the link below to set your email.</p>
        <p>Accounts without an email will be disabled some time in 2025.</p>
        <Link href="/me/account" text="Add email" showRightArrow />
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  captureRemixErrorBoundaryError(error);
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="dark:bg-bgDark text-text-light dark:text-text-dark">
        <Layout user={null} excludeLogin>
          <YifferErrorBoundary />
        </Layout>
      </body>
    </html>
  );
}

function PosthogInit({
  apiKey,
  host,
  userSession,
}: {
  apiKey: string;
  host: string;
  userSession: UserSession | null;
}) {
  useEffect(() => {
    if (!apiKey || !host) return;
    posthog.init(apiKey, {
      api_host: host,
      person_profiles: 'always',
      autocapture: false,
    });
    if (userSession) {
      posthog.identify(userSession.userId.toString(), {
        username: userSession.username,
      });
    }
  }, [apiKey, host, userSession]);

  return null;
}
