import { Form } from '@remix-run/react';
import LoadingButton from '../LoadingButton';
import TextInput from '../TextInput';

export default function Login({ setMode }) {
  return (
    <Form>
      <p>Log in</p>
      <TextInput name="username" label="username" autocomplete="username" />
      <TextInput
        name="password"
        label="password"
        autocomplete="password"
        type="password"
      />
      <LoadingButton text="Log in" />

      <p onClick={() => setMode('signup')}>Sign up instead</p>
      <p onClick={() => setMode('forgottenPassword')}>Forgotten password?</p>
      <a href="/">back to main TODO delete</a>
    </Form>
  );
}
