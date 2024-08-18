import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/cloudflare';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import InfoBox from '~/ui-components/InfoBox';
import Link from '~/ui-components/Link';
import TextInputUncontrolled from '~/ui-components/TextInput/TextInputUncontrolled';
import TopGradientBox from '~/ui-components/TopGradientBox';
import { redirectIfLoggedIn } from '~/utils/loaders';
import {
  create400Json,
  createSuccessJson,
  processApiError,
} from '~/utils/request-helpers';
import { resetPassword } from '~/utils/reset-password.server';
import { useGoodFetcher } from '~/utils/useGoodFetcher';

export async function loader(args: LoaderFunctionArgs) {
  await redirectIfLoggedIn(args);
  return null;
}

export default function ForgottenPassword() {
  const fetcher = useGoodFetcher({
    method: 'post',
    toastError: false,
  });

  return (
    <div className="mx-auto w-full sm:w-[420px] px-8">
      {!fetcher.success && (
        <fetcher.Form className="w-full my-8">
          <TopGradientBox innerClassName="px-8 py-6">
            <h1 className="text-3xl">Forgotten password?</h1>
            <p className="mt-2">
              It happens. Luckily, you can easily recover it via email.
            </p>

            <div className="mt-4 flex flex-col gap-6">
              <TextInputUncontrolled
                name="email"
                label="Email"
                autocomplete="email"
                className="mb-6"
                type="text"
              />
            </div>

            {fetcher?.isError && (
              <InfoBox variant="error" text={fetcher.errorMessage} className="my-2" />
            )}

            <div className="flex">
              <LoadingButton
                text="Reset password via email"
                color="primary"
                variant="contained"
                className="mt-2"
                fullWidth
                isLoading={fetcher.isLoading}
                isSubmit
              />
            </div>
          </TopGradientBox>
        </fetcher.Form>
      )}

      {fetcher.success && (
        <InfoBox
          variant="success"
          text="If the email exists in our system, an email was just sent with instructions to reset your password."
          className="my-8"
        />
      )}

      <div>
        <Link href="/login" text="Log in" showRightArrow />
      </div>
      <div className="mt-2">
        <Link href="/signup" text="Sign up" showRightArrow />
      </div>
    </div>
  );
}

export async function action(args: ActionFunctionArgs) {
  const reqBody = await args.request.formData();
  const formEmail = reqBody.get('email');

  if (!formEmail) {
    return create400Json('Missing fields');
  }

  const email = formEmail.toString().trim();

  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return create400Json('Invalid email');
  }

  const err = await resetPassword(
    args.context.cloudflare.env.DB,
    args.context.cloudflare.env.POSTMARK_TOKEN,
    args.context.cloudflare.env.FRONT_END_URL_BASE,
    email
  );

  if (err) {
    return processApiError('Error in /forgotten-password', err, { email });
  }

  return createSuccessJson();
}
