import { json } from '@remix-run/cloudflare';
import { Form, useFetcher } from '@remix-run/react';
import LoadingButton from '../LoadingButton';
import TextInput from '../TextInput';

export default function Login({ setMode }) {
  const loginRequest = useFetcher();

  function submitLogin() {
    loginRequest.submit({ username: '1', password: '2' }, { action: '/action/login' });
  }

  return (
    <loginRequest.Form>
      <p className="text-3xl">Log in</p>
      <TextInput name="username" label="Username" autocomplete="username" />
      <TextInput
        name="password"
        label="Password"
        autocomplete="password"
        type="password"
      />
      <LoadingButton text="Log in" onClick={() => submitLogin()} />
      <button onClick={() => submitLogin()}>asdasdasd button</button>
      <p onClick={() => submitLogin()}>ASNDKJASd</p>

      <p
        onClick={() => setMode('signup')}
        className="font-bold text-blue-weak-200 dark:text-blue-strong-300 hover:cursor-pointer w-fit"
      >
        Sign up instead
      </p>
      <p
        onClick={() => setMode('forgottenPassword')}
        className="font-bold text-blue-weak-200 dark:text-blue-strong-300 hover:cursor-pointer w-fit"
      >
        Forgotten password?
      </p>
      <a href="/">back to main TODO delete</a>
    </loginRequest.Form>
  );
}
