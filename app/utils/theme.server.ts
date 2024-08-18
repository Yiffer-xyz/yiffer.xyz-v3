import { createCookieSessionStorage } from '@remix-run/cloudflare';
import type { UIPreferences } from '~/types/types';
import { parseUIPreferences } from './theme-provider';

const uiPrefStorage = createCookieSessionStorage({
  cookie: {
    name: 'dev-yiffer-theme',
    secure: false, // TODO:
    sameSite: 'lax',
    path: '/',
    httpOnly: false, // TODO:
  },
});

export async function getUIPrefSession(request: Request) {
  const session = await uiPrefStorage.getSession(request.headers.get('Cookie'));

  return {
    getUiPref: function (): UIPreferences {
      const rawUiPref = session.get('ui-pref');
      const parsedUiPref = parseUIPreferences(rawUiPref);
      return parsedUiPref;
    },
    setUiPref: function (uiPref: UIPreferences) {
      return session.set('ui-pref', JSON.stringify(uiPref));
    },
    commit: async function (): Promise<string> {
      return uiPrefStorage.commitSession(session);
    },
  };
}
