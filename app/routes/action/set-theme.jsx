import { json, redirect } from '@remix-run/cloudflare';
import { getThemeSession } from '../../utils/theme.server';
import { isTheme } from '../../utils/theme-provider';

// By not returning any default component, Remix will use it as a resource route.

export const action = async function ({ request }) {
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

export const loader = async function ({ request }) {
  return redirect('/');
};
