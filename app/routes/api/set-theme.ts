import type { Route } from './+types/set-theme';
import { parseUIPreferences } from '~/utils/theme-provider';
import { getUIPrefSession } from '~/utils/theme.server';
import { noGetRoute } from '~/utils/request-helpers';

export { noGetRoute as loader };

export async function action(args: Route.ActionArgs) {
  const uiPrefSession = await getUIPrefSession(args.request);
  const requestText = await args.request.text();
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
}
