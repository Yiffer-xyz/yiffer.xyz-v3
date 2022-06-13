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

import { useTheme, ThemeProvider, NonFlashOfWrongThemeEls } from './utils/theme-provider';
import { getThemeSession } from './utils/theme.server';

export const meta = () => ({
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

export const loader = async function ({ request }) {
  const themeSession = await getThemeSession(request);
  const data = {
    theme: themeSession.getTheme(),
  };
  return data;
};

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
      <body className="dark:bg-darkBackground dark:text-white">
        <Layout>
          <Outlet />
        </Layout>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default function AppWithProviders() {
  const data = useLoaderData();

  return (
    <ThemeProvider specifiedTheme={data.theme}>
      <App />
    </ThemeProvider>
  );
}

function Layout({ children }) {
  const [, setTheme] = useTheme();

  return (
    <>
      <nav
        className="flex bg-gradient-to-r from-theme1-primary to-theme2-primary dark:bg-none 
          px-4 py-1.5 nav-shadowing justify-between mb-4 text-gray-400 w-full"
      >
        <div className="flex items-center justify-between mx-auto flex-grow">
          <div className="flex gap-6 items-center">
            <a
              href="https://yiffer.xyz"
              className="text-gray-400 hidden lg:block"
              style={{ fontFamily: 'Shrikhand,cursive', fontSize: '1.25rem', fontWeight: 400 }}
            >
              Yiffer.xyz
            </a>
            <a
              href="https://yiffer.xyz"
              className="text-gray-400 block lg:hidden"
              style={{ fontFamily: 'Shrikhand,cursive', fontSize: '1.25rem', fontWeight: 400 }}
            >
              Y
            </a>
            <a href="https://yiffer.xyz/account" className="text-gray-400">
              Account
            </a>
            <a href="https://yiffer.xyz/login" className="text-gray-400">
              Log in
            </a>
          </div>
          <div className="flex gap-4">
            <p
              onClick={() => setTheme('light')}
              className="cursor-pointer font-bold dark:text-linkDark"
            >
              Light
            </p>
            <p
              onClick={() => setTheme('dark')}
              className="cursor-pointer font-bold dark:text-linkDark"
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
