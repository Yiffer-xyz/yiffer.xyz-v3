import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useState } from 'react';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import InfoBox from '~/ui-components/InfoBox';
import Link from '~/ui-components/Link';
import TextInput from '~/ui-components/TextInput/TextInput';
import TopGradientBox from '~/ui-components/TopGradientBox';
import { signup } from '~/utils/auth.server.js';
import { redirectIfLoggedIn } from '~/utils/loaders';
import {
  create400Json,
  createAnyErrorCodeJson,
  processApiError,
} from '~/utils/request-helpers';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
export { YifferErrorBoundary as ErrorBoundary } from '~/utils/error';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');

  const fetcher = useGoodFetcher({
    method: 'post',
    toastError: false,
  });

  return (
    <div className="mx-auto w-full sm:w-[400px] px-8">
      <fetcher.Form className="w-full my-8">
        <TopGradientBox innerClassName="px-8 py-6">
          <h1 className="text-3xl">Sign up</h1>

          <div className="mt-4 flex flex-col gap-6">
            <TextInput
              value={username}
              onChange={setUsername}
              label="Username"
              autocomplete="username"
              className="mb-6 mt-4"
              type="text"
            />

            <TextInput
              value={email}
              onChange={setEmail}
              label="Email"
              autocomplete="email"
              className="mb-6"
              type="text"
            />

            <TextInput
              value={password}
              onChange={setPassword}
              label="Password - at least 6 characters"
              autocomplete="password"
              type="password"
              className="mb-6"
            />

            <TextInput
              value={password2}
              onChange={setPassword2}
              label="Repeat password"
              autocomplete="password"
              type="password"
              className="mb-6"
            />
          </div>

          {fetcher?.isError && (
            <InfoBox
              variant="error"
              text={fetcher.errorMessage}
              className="my-2"
              disableElevation
            />
          )}

          <div className="flex">
            <LoadingButton
              text="Sign up"
              color="primary"
              variant="contained"
              className="mt-2"
              fullWidth
              isLoading={fetcher.isLoading}
              isSubmit
              onClick={e => {
                window.shouldCaptureUser = true;
                e.preventDefault();
                fetcher.submit({
                  username,
                  email,
                  password,
                  password2,
                });
              }}
            />
          </div>
        </TopGradientBox>
      </fetcher.Form>

      <div>
        <Link href="/login" text="Log in" showRightArrow />
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
    email: formEmail,
    password: formPassword,
    password2: formPassword2,
  } = Object.fromEntries(reqBody);

  if (!formUsername || !formEmail || !formPassword || !formPassword2) {
    return create400Json('Missing fields');
  }

  const username = formUsername.toString().trim();
  const email = formEmail.toString().trim();
  const password = formPassword.toString().trim();
  const password2 = formPassword2.toString().trim();

  const validationErr = getSignupValidationError(username, email, password, password2);
  if (validationErr) {
    return create400Json(validationErr);
  }
  const { err, redirect, errorMessage } = await signup(
    username,
    email,
    password,
    args.context.cloudflare.env.DB,
    args.context.cloudflare.env.JWT_CONFIG_STR,
    args.context.cloudflare.env.POSTMARK_TOKEN
  );

  if (err) {
    return processApiError('Error in /signup', err, { username, email });
  }
  if (errorMessage) {
    return createAnyErrorCodeJson(401, errorMessage);
  }
  throw redirect;
}

function getSignupValidationError(
  username: string,
  email: string,
  password: string,
  password2: string
): string | undefined {
  if (!username) {
    return 'Missing username';
  }
  if (username.length < 2 || username.length > 25) {
    return 'Username must be between 2 and 25 characters';
  }
  if (!password || !password2) {
    return 'Missing password';
  }
  if (password !== password2) {
    return 'Passwords do not match';
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters';
  }
  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return 'Invalid email';
  }

  return;
}
