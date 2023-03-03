import { LoaderFunction, MetaFunction } from '@remix-run/cloudflare';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react';
import clsx from 'clsx';

import styles from './styles/app.css';
import rootStyles from './styles/main.css';
import { UserSession } from './types/types';
import { getUserSession } from './utils/auth.server';

import { NonFlashOfWrongThemeEls, ThemeProvider, useTheme } from './utils/theme-provider';
import { getThemeSession } from './utils/theme.server';

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'New Remix App',
  viewport: 'width=device-width,initial-scale=1',
});

// TODO: How to do preconnect
/* <link rel="preconnect" href="https://fonts.googleapis.com"> */
/* <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>  */

export function links() {
  return [
    { rel: 'stylesheet', href: styles },
    { rel: 'stylesheet', href: rootStyles },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Mulish:wght@300;600&display=swap',
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Shrikhand&text=Yiffer.xyz&display=swap',
    },
  ];
}

export const loader: LoaderFunction = async function ({ request, context }) {
  const themeSession = await getThemeSession(request);
  const userSession = await getUserSession(request, context.JWT_CONFIG_STR);

  const data = {
    theme: themeSession.getTheme(),
    user: userSession,
    frontPageUrl: context.FRONT_PAGE_URL,
  };
  return data;
};

// export const UserContext = createContext('user');

export function App() {
  const [theme] = useTheme();
  const data = useLoaderData();

  return (
    <html lang="en" className={clsx(theme)}>
      <head>
        <Meta />
        <Links />
        <NonFlashOfWrongThemeEls ssrTheme={Boolean(data.theme)} />
      </head>
      <body className="dark:bg-bgDark text-text-light dark:text-text-dark">
        <Layout user={data.user} frontPageUrl={data.frontPageUrl}>
          {/* <UserContext.Provider value={data.user}> */}
          <Outlet />
          {/* </UserContext.Provider> */}
        </Layout>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
          }}
        />
      </body>
    </html>
  );
}

// TODO: Make it work later. Currently causes infinite error loops.
// export function ErrorBoundary({ error }: { error: Error }) {
//   return (
//     <>
//       <div role="alert">
//         <p>Something went wrong:(</p>
//         <p>Nice error message here, hide stack of course.</p>
//       </div>
//       <pre>
//         <code>{error.message}</code>
//       </pre>
//       <pre>
//         <code>{error?.stack}</code>
//       </pre>
//     </>
//   );
// }

export default function AppWithProviders() {
  const data = useLoaderData();

  return (
    <ThemeProvider specifiedTheme={data.theme}>
      <App />
    </ThemeProvider>
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
  const [, setTheme] = useTheme();
  const isLoggedIn = !!user;
  const isMod = true; // TODO:

  return (
    <>
      <nav
        className="flex bg-gradient-to-r from-theme1-primary to-theme2-primary dark:bg-none
          px-4 py-1.5 nav-shadowing justify-between mb-4 text-gray-400 w-full z-20"
      >
        <div className="flex items-center justify-between mx-auto flex-grow max-w-full lg:max-w-80p">
          <div className="flex gap-6 items-center">
            <a
              href={frontPageUrl}
              className="text-gray-400 hidden lg:block bg-none dark:text-blue-strong-300"
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
              className="text-gray-400 block lg:hidden bg-none dark:text-blue-strong-300"
              style={{
                fontFamily: 'Shrikhand,cursive',
                fontSize: '1.25rem',
                fontWeight: 400,
              }}
            >
              Y
            </a>
            {isLoggedIn ? (
              <>
                <a
                  href="https://yiffer.xyz/account"
                  className="text-gray-400 font-semibold bg-none dark:text-blue-strong-300"
                >
                  Account
                </a>
                {isMod && (
                  <a
                    href="/admin"
                    className="font-semibold bg-none dark:text-blue-strong-300"
                  >
                    Admin
                  </a>
                )}
                <a
                  href="/logout"
                  className="font-semibold bg-none dark:text-blue-strong-300"
                >
                  Log out
                </a>
              </>
            ) : (
              <a
                href="/login"
                className="text-gray-400 font-semibold bg-none dark:text-blue-strong-300"
              >
                Log in
              </a>
            )}
          </div>
          <div className="flex gap-6">
            <p
              onClick={() => setTheme('light')}
              className="cursor-pointer font-bold dark:text-blue-strong-300"
            >
              Light
            </p>
            <p
              onClick={() => setTheme('dark')}
              className="cursor-pointer font-bold dark:text-blue-strong-300"
            >
              Dark
            </p>
          </div>
        </div>
      </nav>
      {children}
    </>
  );
}
