import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/cloudflare';
import { useEffect } from 'react';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import InfoBox from '~/ui-components/InfoBox';
import Link from '~/ui-components/Link';
import TextInputUncontrolled from '~/ui-components/TextInput/TextInputUncontrolled';
import TopGradientBox from '~/ui-components/TopGradientBox';
import { logIPAndVerifyNoSignupSpam } from '~/utils/auth.server';
import { redirectIfLoggedIn } from '~/utils/loaders';
import {
  create400Json,
  createSuccessJson,
  processApiError,
} from '~/utils/request-helpers';
import { resetPassword } from '~/utils/reset-password.server';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import posthog from 'posthog-js';
export { YifferErrorBoundary as ErrorBoundary } from '~/utils/error';

export async function loader(args: LoaderFunctionArgs) {
  await redirectIfLoggedIn(args);
  return null;
}

export default function ForgottenPassword() {
  const fetcher = useGoodFetcher({
    method: 'post',
    toastError: false,
  });

  useEffect(() => {
    if (fetcher.errorMessage && fetcher.errorMessage.toLowerCase().includes('spam')) {
      posthog.capture('Spam forgotten password detected');
    }
  }, [fetcher.errorMessage]);

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
              <InfoBox
                variant="error"
                text={fetcher.errorMessage}
                className="my-2"
                disableElevation
              />
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
                onClick={() => {
                  posthog.capture('Password reset');
                }}
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

  const email = formEmail.toString().trim().toLowerCase();

  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return create400Json('Invalid email');
  }

  const ip =
    args.request.headers.get('CF-Connecting-IP') ||
    args.request.headers.get('cf-connecting-ip');

  const spamResult = await logIPAndVerifyNoSignupSpam(
    args.context.cloudflare.env.DB,
    email,
    ip
  );

  if (spamResult.err) {
    return processApiError('Error in /forgotten-password', spamResult.err, { email });
  } else if (spamResult.result.isSpam) {
    return create400Json('Spam detected');
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
