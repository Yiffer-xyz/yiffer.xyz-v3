import { ActionArgs, LoaderArgs } from '@remix-run/cloudflare';
import LoadingButton from '~/components/Buttons/LoadingButton';
import InfoBox from '~/components/InfoBox';
import Link from '~/components/Link';
import TextInputUncontrolled from '~/components/TextInput/TextInputUncontrolled';
import { login } from '~/utils/auth.server.js';
import { redirectIfLoggedIn } from '~/utils/loaders';
import {
  create400Json,
  createAnyErrorCodeJson,
  processApiError,
} from '~/utils/request-helpers';
import { useGoodFetcher } from '~/utils/useGoodFetcher';

export default function Signup() {
  const fetcher = useGoodFetcher({
    method: 'post',
    toastError: false,
  });

  return (
    <fetcher.Form className="max-w-xs mx-auto">
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

      {fetcher.isError && (
        <InfoBox variant="error" text={fetcher.errorMessage} className="my-2" />
      )}

      <div className="flex">
        <LoadingButton
          text="Log in"
          color="primary"
          variant="contained"
          className="mt-2 mb-6"
          fullWidth
          isLoading={fetcher.isLoading}
          isSubmit
        />
      </div>

      <Link href="/signup" text="Sign up instead" />
      <br />
      <Link href="/forgotten-password" text="Forgotten password?" />
    </fetcher.Form>
  );
}

export async function loader(args: LoaderArgs) {
  await redirectIfLoggedIn(args);
  return null;
}

export async function action(args: ActionArgs) {
  const reqBody = await args.request.formData();
  const { username: formUsername, password: formPassword } = Object.fromEntries(reqBody);

  if (!formUsername || !formPassword) {
    return create400Json('Missing username or password');
  }

  const username = formUsername.toString().trim();
  const password = formPassword.toString().trim();

  const { err, redirect, errorMessage } = await login(
    username,
    password,
    args.context.DB_API_URL_BASE as string,
    args.context.JWT_CONFIG_STR as string
  );

  if (err) {
    return processApiError('Error in /login', err, { username, password });
  }
  if (errorMessage) {
    return createAnyErrorCodeJson(401, errorMessage);
  }
  throw redirect;
}
