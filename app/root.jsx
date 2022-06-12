import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from '@remix-run/react';
import clsx from 'clsx';

import styles from './styles/app.css';

import { useTheme, ThemeProvider } from './utils/theme-provider';
import { getThemeSession } from './utils/theme.server';

export const meta = () => ({
  charset: 'utf-8',
  title: 'New Remix App',
  viewport: 'width=device-width,initial-scale=1',
});

/* <link rel="preconnect" href="https://fonts.googleapis.com"> */
/* <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>  */

export function links() {
  return [
    { rel: 'stylesheet', href: styles },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Mulish:wght@300;600&display=swap' },
  ];
}

export const loader = async function ({ request }) {
  const themeSession = await getThemeSession(request);
  console.log('loader root says', themeSession.getTheme());
  const data = {
    theme: themeSession.getTheme(),
  };
  return data;
};

export function App() {
  const [theme] = useTheme();

  return (
    <html lang="en" className={clsx(theme)}>
      <head>
        <Meta />
        <Links />
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
        className="flex gap-4 bg-gradient-to-r from-theme1 to-theme2 dark:bg-none p-2"
        style={{ boxShadow: '0 0 5px rgb(0 0 0 / 10%)' }}
      >
        <a href="https://yiffer.xyz">Yiffer.xyz</a>
        <a href="https://yiffer.xyz/account">Account</a>
        <a href="https://yiffer.xyz/login">Log in</a>
        <p onClick={() => setTheme('light')}>Light</p>
        <p onClick={() => setTheme('dark')}>Dark</p>
      </nav>
      {children}
    </>
  );
}
