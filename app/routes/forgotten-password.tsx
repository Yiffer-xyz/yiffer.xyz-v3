import { LoaderArgs } from '@remix-run/cloudflare';
import { Form } from '@remix-run/react';
import Link from '~/components/Link';
import { redirectIfLoggedIn } from '~/utils/loaders';

export async function loader(args: LoaderArgs) {
  await redirectIfLoggedIn(args);
  return null;
}

export default function ForgottenPassword() {
  return (
    <Form method="post" className="max-w-xs mx-auto">
      <h1 className="text-3xl">Forgotten password</h1>

      <p>Content here.</p>

      <Link href="/login" text="Log in instead" className="mb-4" />
      <br />
      <Link href="/signup" text="Sign up instead" />
    </Form>
  );
}
