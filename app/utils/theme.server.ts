import { createCookieSessionStorage } from '@remix-run/cloudflare';
import { isTheme } from './theme-provider';

const themeStorage = createCookieSessionStorage({
  cookie: {
    name: 'dev-yiffer-theme',
    secure: true,
    sameSite: 'lax',
    path: '/',
    httpOnly: false, // TODO:
  },
});

async function getThemeSession(request: Request) {
  const session = await themeStorage.getSession(request.headers.get('Cookie'));

  return {
    getTheme: function (): string {
      const themeVal = session.get('theme');
      return isTheme(themeVal) ? themeVal : null;
    },
    setTheme: function (theme: string | null) {
      return session.set('theme', theme);
    },
    commit: async function (): Promise<string> {
      return themeStorage.commitSession(session);
    },
  };
}

export { getThemeSession };
