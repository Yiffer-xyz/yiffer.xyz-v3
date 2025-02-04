import Button from '~/ui-components/Buttons/Button';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import { useLoaderData, useRevalidator } from '@remix-run/react';
import Link from '~/ui-components/Link';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { fullUserLoader } from '~/utils/loaders';
import Breadcrumbs from '~/ui-components/Breadcrumbs/Breadcrumbs';

export const meta: MetaFunction = () => {
  return [{ title: `My Patreon | Yiffer.xyz` }];
};

export async function loader(args: LoaderFunctionArgs) {
  const user = await fullUserLoader(args);
  return {
    user,
    patreonClientId: args.context.cloudflare.env.PATREON_CLIENT_ID,
    patreonRedirectUrl: args.context.cloudflare.env.PATREON_REDIRECT_URL,
  };
}

export default function AccountPatreon() {
  const { user, patreonClientId, patreonRedirectUrl } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();

  const syncPatreonFetcher = useGoodFetcher({
    url: '/api/sync-patrons',
    method: 'get',
    toastSuccessMessage: 'Patreon status synced',
    onFinish: () => {
      revalidator.revalidate();
    },
  });

  const unlinkPatreonEmailFetcher = useGoodFetcher({
    url: '/api/unlink-patreon-email',
    method: 'get',
    toastSuccessMessage: 'Patreon account unlinked',
    onFinish: () => {
      revalidator.revalidate();
    },
  });

  return (
    <div className="container mx-auto pb-8">
      <h1>Patreon</h1>

      <Breadcrumbs prevRoutes={[{ text: 'Me', href: '/me' }]} currentRoute="Patreon" />

      {user.patreonEmail && !user.patreonDollars && (
        <>
          <p>
            You have successfully connected your Patreon account (email:{' '}
            {user.patreonEmail}), but no active pledges were found.
          </p>

          <LoadingButton
            text="Re-sync Patreon status"
            className="mt-1"
            onClick={() => {
              syncPatreonFetcher.submit();
            }}
            isLoading={syncPatreonFetcher.isLoading}
          />
        </>
      )}

      {user.patreonEmail && user.patreonDollars && (
        <>
          <p>
            Your Patreon subscription of ${user.patreonDollars} is recognized and
            appreciated ❤️
          </p>
          <p>
            If you just linked, you might have to <b>log out and back in again</b> to have
            your perks take effect.
          </p>

          <h4 className="mt-6">Rewards</h4>
          <p>
            You're in the <Link href="/patreon" text="Patron list" isInsideParagraph />.
            Once we implement public user profiles, your patronage will show there as
            well!
          </p>

          {user.patreonEmail && (
            <>
              <h4 className="mt-6">Linked account</h4>
              <p>
                The email of your linked Patreon account is {user.patreonEmail}. If you
                for some reason want to unlink it you can do so.
              </p>

              <LoadingButton
                text="Unlink Patreon email"
                className="mt-1"
                isLoading={unlinkPatreonEmailFetcher.isLoading}
                color="error"
                onClick={() => {
                  unlinkPatreonEmailFetcher.submit();
                }}
              />
            </>
          )}
        </>
      )}

      {!user.patreonEmail && (
        <>
          <p>Your account is currently not connected to Patreon.</p>

          <Button
            onClick={() => {
              window.location.href = `https://www.patreon.com/oauth2/authorize?response_type=code&client_id=${patreonClientId}&redirect_uri=${patreonRedirectUrl}&state=${user.id}`;
            }}
            text="Log in to Patreon & sync"
            className="mt-2"
          />
        </>
      )}
    </div>
  );
}
