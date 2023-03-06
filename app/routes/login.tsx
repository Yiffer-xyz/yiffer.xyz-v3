import { ActionArgs, LoaderArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { Form, useActionData, useTransition } from '@remix-run/react';
import LoadingButton from '~/components/Buttons/LoadingButton';
import InfoBox from '~/components/InfoBox';
import Link from '~/components/Link';
import TextInputUncontrolled from '~/components/TextInput/TextInputUncontrolled';
import { login } from '~/utils/auth.server.js';
import { redirectIfLoggedIn } from '~/utils/loaders';

export async function loader(args: LoaderArgs) {
  await redirectIfLoggedIn(args);
  return null;
}

export async function action(args: ActionArgs) {
  const reqBody = await args.request.formData();
  const { username: formUsername, password: formPassword } = Object.fromEntries(reqBody);

  if (!formUsername || !formPassword) {
    return json({ error: 'Missing username or password' }, { status: 400 });
  }

  const username = formUsername.toString().trim();
  const password = formPassword.toString().trim();

  const { redirect, errorMessage } = await login(
    username,
    password,
    args.context.DB_API_URL_BASE as string,
    args.context.JWT_CONFIG_STR as string
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
      <h1 className="text-3xl">Log in</h1>

      <div className="mt-4 flex flex-col gap-6">
        <TextInputUncontrolled
          name="username"
          label="Username or email"
          autocomplete="username"
          className="mb-6 mt-4"
          type="text"
        />

        <TextInputUncontrolled
          name="password"
          label="Password - at least 6 characters"
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
          text="Log in"
          color="primary"
          variant="contained"
          className="mt-2 mb-6"
          fullWidth
          isLoading={transition.state === 'submitting'}
        />
      </div>

      <Link href="/signup" text="Sign up instead" />
      <br />
      <Link href="/forgotten-password" text="Forgotten password?" />
    </Form>
  );
}
