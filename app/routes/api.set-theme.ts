import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare';
import { json, redirect } from '@remix-run/cloudflare';
import { isTheme } from '~/utils/theme-provider';
import { getThemeSession } from '~/utils/theme.server';

export const action: ActionFunction = async function ({ request }) {
  const themeSession = await getThemeSession(request);
  const requestText = await request.text();
  const form = new URLSearchParams(requestText);
  const theme = form.get('theme');

  if (!isTheme(theme)) {
    return json({
      success: false,
      message: `Theme value ${theme} is not valid`,
    });
  }

  themeSession.setTheme(theme);
  return json(
    {
      success: true,
    },
    {
      headers: {
        'Set-Cookie': await themeSession.commit(),
      },
    }
  );
};

export const loader: LoaderFunction = async function ({ request }) {
  return redirect('/');
};
