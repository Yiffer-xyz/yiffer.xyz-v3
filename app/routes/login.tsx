import InfoBox from '~/ui-components/InfoBox';
import Link from '~/ui-components/Link';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import { login } from '~/utils/auth.server.js';
import { redirectIfLoggedIn } from '~/utils/loaders';
import {
  create400Json,
  createAnyErrorCodeJson,
  processApiError,
} from '~/utils/request-helpers';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import TopGradientBox from '~/ui-components/TopGradientBox';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useState } from 'react';
import TextInput from '~/ui-components/TextInput/TextInput';
import { useLocation } from '@remix-run/react';
import { useAuthRedirect } from '~/utils/general';
export { YifferErrorBoundary as ErrorBoundary } from '~/utils/error';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const location = useLocation();

  const fetcher = useGoodFetcher({
    method: 'post',
    toastError: false,
  });

  const { redirectAfterAuthStr } = useAuthRedirect();

  return (
    <div className="mx-auto w-full sm:w-[400px] px-8">
      <fetcher.Form className="w-full my-8">
        <TopGradientBox innerClassName="px-8 py-6">
          <h1 className="text-3xl">Log in</h1>

          <div className="mt-4 flex flex-col gap-6">
            <TextInput
              value={username}
              onChange={setUsername}
              name="username"
              label="Username or email"
              autocomplete="username"
              className="mb-6 mt-4"
              type="text"
            />

            <TextInput
              value={password}
              onChange={setPassword}
              name="password"
              label="Password - at least 6 characters"
              autocomplete="password"
              type="password"
              className="mb-6"
            />
          </div>

          {fetcher.isError && (
            <InfoBox
              variant="error"
              text={fetcher.errorMessage}
              className="my-2"
              disableElevation
            />
          )}

          <div className="flex">
            <LoadingButton
              text="Log in"
              color="primary"
              variant="contained"
              className="mt-2"
              fullWidth
              isLoading={fetcher.isLoading}
              isSubmit
              onClick={e => {
                window.shouldCaptureUser = true;
                e.preventDefault();
                fetcher.submit({ username, password, redirect: redirectAfterAuthStr });
              }}
            />
          </div>
        </TopGradientBox>
      </fetcher.Form>

      <div>
        <Link href={`/signup${location.search}`} text="Sign up" showRightArrow />
      </div>
      <div className="mt-2">
        <Link href="/forgotten-password" text="Forgotten password?" showRightArrow />
      </div>
    </div>
  );
}

export async function loader(args: LoaderFunctionArgs) {
  await redirectIfLoggedIn(args);
  return null;
}

export async function action(args: ActionFunctionArgs) {
  const reqBody = await args.request.formData();
  const {
    username: formUsername,
    password: formPassword,
    redirect: formRedirect,
  } = Object.fromEntries(reqBody);

  if (!formUsername || !formPassword) {
    return create400Json('Missing username or password');
  }

  const redirectTo =
    !formRedirect || formRedirect === 'null' ? undefined : formRedirect.toString().trim();

  const username = formUsername.toString().trim();
  const password = formPassword.toString().trim();

  const { err, redirect, errorMessage } = await login({
    username,
    password,
    db: args.context.cloudflare.env.DB,
    jwtConfigStr: args.context.cloudflare.env.JWT_CONFIG_STR,
    redirectTo,
  });

  if (err) {
    return processApiError('Error in /login', err, { username, password });
  }
  if (errorMessage) {
    return createAnyErrorCodeJson(401, errorMessage);
  }

  throw redirect;
}
