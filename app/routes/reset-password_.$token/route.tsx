import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
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
import { resetPasswordByLink } from '~/utils/reset-password.server';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
export { YifferErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction = () => {
  return [{ title: `Reset password | Yiffer.xyz` }];
};

export async function loader(args: LoaderFunctionArgs) {
  await redirectIfLoggedIn(args);
  return { token: args.params.token as string };
}

export default function ResetPassword() {
  const { token } = useLoaderData<typeof loader>();

  const fetcher = useGoodFetcher({
    method: 'post',
    toastError: false,
  });

  return (
    <div className="mx-auto w-full sm:w-[420px] px-8">
      {!fetcher.success && (
        <>
          <fetcher.Form className="w-full my-8">
            <TopGradientBox innerClassName="px-8 py-6">
              <h1 className="text-3xl">Reset password</h1>
              <div className="mt-4 flex flex-col gap-6">
                <TextInputUncontrolled
                  name="password"
                  label="New password"
                  autocomplete="password"
                  type="password"
                />
              </div>

              <input type="hidden" name="resetToken" value={token} />

              {fetcher?.isError && (
                <InfoBox variant="error" text={fetcher.errorMessage} className="mt-8" />
              )}

              <div className="flex mt-4">
                <LoadingButton
                  text="Save new password"
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

          <Link href="/login" text="To login" showRightArrow className="mt-4" />
        </>
      )}

      {fetcher.success && (
        <>
          <InfoBox
            variant="success"
            text="Your password has been reset."
            className="mt-8 mb-4"
          />

          <Link href="/login" text="Log in" showRightArrow />
        </>
      )}
    </div>
  );
}

export async function action(args: ActionFunctionArgs) {
  const reqBody = await args.request.formData();
  const formPassword = reqBody.get('password');
  const formToken = reqBody.get('resetToken');

  if (!formPassword || !formToken) {
    return create400Json('Missing reset token or password.');
  }

  const password = formPassword.toString().trim();
  const resetToken = formToken.toString().trim();

  if (password.length < 6) {
    return create400Json('Password must be at least 6 characters.');
  }

  const { err, errorMessage } = await resetPasswordByLink(
    args.context.cloudflare.env.DB,
    resetToken,
    password
  );

  if (err) {
    return processApiError('Error in /reset-password', err, { resetToken });
  }
  if (errorMessage) {
    return create400Json(errorMessage);
  }

  return createSuccessJson();
}
