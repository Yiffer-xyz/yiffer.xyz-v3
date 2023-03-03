import type { ActionFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { Form, useActionData, useTransition } from '@remix-run/react';
import LoadingButton from '~/components/Buttons/LoadingButton';
import InfoBox from '~/components/InfoBox';
import Link from '~/components/Link';
import TextInputUncontrolled from '~/components/TextInput/TextInputUncontrolled';
import { login } from '~/utils/auth.server.js';

function getDataError(username: any, password: any) {
  if (!username || typeof username !== 'string') {
    return 'Missing username';
  }
  if (!password || typeof password !== 'string') {
    return 'Missing password';
  }
  return null;
}

export const action: ActionFunction = async function ({ request, context }) {
  const reqBody = await request.formData();
  const { username, password } = Object.fromEntries(reqBody);

  const fields = { username, password };
  const validationErr = getDataError(username, password);
  if (validationErr) {
    return json({ error: validationErr, fields }, { status: 400 });
  }

  const response = await login(
    username as string,
    password as string,
    context.URL_BASE_OLD_DO_NOT_USE as string,
    context.JWT_CONFIG_STR as string
  );
  if (response === false) {
    return json({ error: 'Incorrect username or password', fields }, { status: 401 });
  }

  return response;
};

export default function Login() {
  const actionData = useActionData();
  const transition = useTransition();

  return (
    <Form method="post" className="w-fit mx-auto">
      <h1 className="text-3xl">Log in</h1>

      <a href="/" className="my-2 block">
        back to "/" TODO delete
      </a>
      <p className="text-red-400">At some point, put this in a modal instead?</p>

      <TextInputUncontrolled
        name="username"
        label="Username"
        autocomplete="username"
        className="mb-6 mt-4"
        type="text"
      />

      <TextInputUncontrolled
        name="password"
        label="Password"
        autocomplete="password"
        type="password"
        className="mb-6"
      />

      {actionData?.error && (
        <InfoBox variant="error" text={actionData.error} className="my-2" />
      )}

      <div className="flex">
        <LoadingButton
          text="Log in"
          color="primary"
          variant="contained"
          className="my-2"
          isLoading={transition.state === 'submitting'}
        />
      </div>

      <Link href="/signup" text="Sign up instead" />
      <br />
      <Link href="/forgotten-password" text="Forgotten password?" />
    </Form>
  );
}
