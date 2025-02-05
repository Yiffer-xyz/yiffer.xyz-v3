import { redirect, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { syncPatreonTiers } from '~/route-funcs/sync-patreon-tiers';
import { updateUser } from '~/route-funcs/update-user';
import { create400Json, logErrorExternally } from '~/utils/request-helpers';

export async function loader(args: LoaderFunctionArgs) {
  const clientId = args.context.cloudflare.env.PATREON_CLIENT_ID;
  const clientSecret = args.context.cloudflare.env.PATREON_CLIENT_SECRET;
  const redirectUrl = args.context.cloudflare.env.PATREON_REDIRECT_URL;
  const oauthGrantCode = new URL(args.request.url).searchParams.get('code');
  const userId = new URL(args.request.url).searchParams.get('state');

  if (!oauthGrantCode || !userId) {
    return create400Json('Missing code or state');
  }
  if (Number.isNaN(userId)) {
    return create400Json('Invalid state, must be number');
  }

  const tokenRes = await fetch('https://www.patreon.com/api/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code: oauthGrantCode,
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUrl,
    }),
  });

  const data: any = await tokenRes.json();
  const accessToken = data.access_token;

  if (!accessToken) {
    await logErrorExternally({
      error: {
        isClientError: false,
        isServerError: true,
        logMessage: 'Patreon callback failed to get access token',
        context: { data },
      },
    });
    return create400Json('No access token');
  }

  const userRes = await fetch(`https://www.patreon.com/api/oauth2/api/current_user?in`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (userRes.status !== 200) {
    const resJson = await userRes.json();
    await logErrorExternally({
      error: {
        isClientError: false,
        isServerError: true,
        logMessage: 'Patreon callback failed to get user data with accessToken',
        context: { resJson },
      },
    });
    return create400Json('Failed to get user data');
  }

  const userData: any = await userRes.json();

  const patreonEmail = userData.data?.attributes?.email;
  if (!patreonEmail) {
    await logErrorExternally({
      error: {
        isClientError: false,
        isServerError: true,
        logMessage: 'Patreon callback failed to get user email',
        context: { userData },
      },
    });
    return create400Json('Failed to get user email');
  }

  const updateUserRes = await updateUser(args.context.cloudflare.env.DB, Number(userId), {
    patreonEmail,
  });

  if (updateUserRes?.error) {
    await logErrorExternally({
      error: {
        isClientError: false,
        isServerError: true,
        logMessage: 'Patreon callback failed to update user',
        context: { updateUserRes, userId, patreonEmail },
      },
    });
    return create400Json('Failed to update user');
  }

  await syncPatreonTiers(
    args.context.cloudflare.env.DB,
    args.context.cloudflare.env.PATREON_CAMPAIGN_ID,
    args.context.cloudflare.env.PATREON_CREATOR_ACCESS_TOKEN
  );

  return redirect(`/me/patreon`);
}
