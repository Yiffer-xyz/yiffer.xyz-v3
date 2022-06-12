import { createCookieSessionStorage } from '@remix-run/cloudflare';
import { isTheme } from './theme-provider';

const sessionSecret = 'asdasdasd12311'; // TODO: something

if (!sessionSecret) {
  throw new Error('SESSION_SECRET must be set');
}

const themeStorage = createCookieSessionStorage({
  cookie: {
    name: 'dev-yiffer-theme',
    secure: true,
    secrets: [sessionSecret],
    sameSite: 'lax',
    path: '/',
    httpOnly: false, // TODO:
  },
});

async function getThemeSession(request) {
  const session = await themeStorage.getSession(request.headers.get('Cookie'));

  return {
    getTheme: function () {
      const themeVal = session.get('theme');
      return isTheme(themeVal) ? themeVal : null;
    },
    setTheme: function (theme) {
      console.log('set theme!', theme);
      session.set('theme', theme);
    },
    commit: function () {
      themeStorage.commitSession(session);
    },
  };
}

export { getThemeSession };
