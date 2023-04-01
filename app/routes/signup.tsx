import { ActionArgs, LoaderArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { Form, useActionData, useTransition } from '@remix-run/react';
import LoadingButton from '~/components/Buttons/LoadingButton';
import InfoBox from '~/components/InfoBox';
import Link from '~/components/Link';
import TextInputUncontrolled from '~/components/TextInput/TextInputUncontrolled';
import { signup } from '~/utils/auth.server.js';
import { redirectIfLoggedIn } from '~/utils/loaders';

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

export async function loader(args: LoaderArgs) {
  await redirectIfLoggedIn(args);
  return null;
}

export async function action(args: ActionArgs) {
  const reqBody = await args.request.formData();
  const {
    username: formUsername,
    email: formEmail,
    password: formPassword,
    password2: formPassword2,
  } = Object.fromEntries(reqBody);

  if (!formUsername || !formEmail || !formPassword || !formPassword2) {
    return json({ error: 'Missing fields' }, { status: 400 });
  }

  const username = formUsername.toString().trim();
  const email = formEmail.toString().trim();
  const password = formPassword.toString().trim();
  const password2 = formPassword2.toString().trim();

  const validationErr = getSignupValidationError(username, email, password, password2);
  if (validationErr) {
    return json({ error: validationErr }, { status: 400 });
  }
  const { redirect, errorMessage } = await signup(
    username,
    email,
    password,
    args.context.DB_API_URL_BASE as string,
    args.context.JWT_CONFIG_STR as string,
    args.context.POSTMARK_TOKEN as string
  );

  if (errorMessage) {
    return json({ error: errorMessage }, { status: 401 });
  }
  throw redirect;
}

export default function Signup() {
  const actionData = useActionData<typeof action>();
  const transition = useTransition();

  return (
    <Form method="post" className="max-w-xs mx-auto">
      <h1 className="text-3xl">Sign up</h1>

      <div className="mt-4 flex flex-col gap-6">
        <TextInputUncontrolled
          name="username"
          label="Username"
          autocomplete="username"
          className="mb-6 mt-4"
          type="text"
        />

        <TextInputUncontrolled
          name="email"
          label="Email"
          autocomplete="email"
          className="mb-6"
          type="text"
        />

        <TextInputUncontrolled
          name="password"
          label="Password - at least 6 characters"
          autocomplete="password"
          type="password"
          className="mb-6"
        />

        <TextInputUncontrolled
          name="password2"
          label="Repeat password"
          autocomplete="password"
          type="password"
          className="mb-6"
        />
      </div>

      {actionData?.error && (
        <InfoBox variant="error" text={actionData.error} className="my-2" />
      )}

      <div className="flex">
        <LoadingButton
          text="Sign up"
          color="primary"
          variant="contained"
          className="mt-2 mb-6"
          fullWidth
          isLoading={transition.state === 'submitting'}
          isSubmit
        />
      </div>

      <Link href="/login" text="Log in instead" />
      <br />
      <Link href="/forgotten-password" text="Forgotten password?" />
    </Form>
  );
}
