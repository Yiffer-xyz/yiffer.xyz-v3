import { json, redirect } from '@remix-run/cloudflare';
import { useFetcher } from '@remix-run/react';
import Link from '../../components/Link';
import LoadingButton from '../../components/LoadingButton';
import TextInput from '../../components/TextInput';

export const action = async function ({ request }) {
  const reqBody = await request.formData();
  const { username, password } = Object.fromEntries(reqBody);
  console.log(username, password);

  try {
    return redirect('/');
    // return json({ username: username, userType: 'admin' });
  } catch (error) {
    return json({ error: error.message });
  }
};

export default function Login({ setMode }) {
  const loginRequest = useFetcher();

  return (
    <loginRequest.Form method="POST" className="w-fit mx-auto">
      <h1 className="text-3xl">Log in</h1>

      <a href="/" className="my-2 block">
        back to "/" TODO delete
      </a>
      <p className="text-red-400">At some point, put this in a modal instead?</p>

      <TextInput name="username" label="Username" autocomplete="username" />
      <TextInput
        name="password"
        label="Password"
        autocomplete="password"
        type="password"
      />

      <div className="flex">
        <LoadingButton text="Log in" variant="contained" />
      </div>

      <Link href="/signup" text="Sign up instead" />
      <br />
      <Link href="/forgotten-password" text="Forgotten password?" />
    </loginRequest.Form>
  );
}
