import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare';
import { redirect } from '@remix-run/cloudflare';
import { parseUIPreferences } from '~/utils/theme-provider';
import { getUIPrefSession } from '~/utils/theme.server';

export const action: ActionFunction = async function ({ request }) {
  const uiPrefSession = await getUIPrefSession(request);
  const requestText = await request.text();
  const form = new URLSearchParams(requestText);
  const uiPref = form.get('uiPref');

  const parsedUIPref = parseUIPreferences(uiPref);
  uiPrefSession.setUiPref(parsedUIPref);

  return Response.json(
    { success: true },
    {
      headers: {
        'Set-Cookie': await uiPrefSession.commit(),
      },
    }
  );
};

export const loader: LoaderFunction = async function ({ request }) {
  return redirect('/');
};
