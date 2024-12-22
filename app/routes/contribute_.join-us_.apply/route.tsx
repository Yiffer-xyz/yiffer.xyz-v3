import { useLoaderData } from '@remix-run/react';
import { useState } from 'react';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import InfoBox from '~/ui-components/InfoBox';
import TextareaUncontrolled from '~/ui-components/Textarea/TextareaUncontrolled';
import TextInputUncontrolled from '~/ui-components/TextInput/TextInputUncontrolled';
import TopGradientBox from '~/ui-components/TopGradientBox';
import { getModApplicationForUser } from '~/route-funcs/get-mod-application';
import { queryDbExec } from '~/utils/database-facade';
import { authLoader, redirectIfNotLoggedIn } from '~/utils/loaders';
import {
  create400Json,
  create500Json,
  createSuccessJson,
  logApiError,
  processApiError,
} from '~/utils/request-helpers';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import Breadcrumbs from '~/ui-components/Breadcrumbs/Breadcrumbs';
import type {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  MetaFunction,
} from '@remix-run/cloudflare';
export { YifferErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction = () => {
  return [{ title: `Mod application | Yiffer.xyz` }];
};

export default function Apply() {
  const fetcher = useGoodFetcher({
    method: 'post',
    toastError: false,
    toastSuccessMessage: 'Application submitted!',
    preventToastClose: true,
  });
  const { hasExistingApplication } = useLoaderData<typeof loader>();
  const [notesIsValid, setNotesIsValid] = useState(false);
  const [telegramIsValid, setTelegramIsValid] = useState(false);

  return (
    <div className="container mx-auto pb-8">
      <h1>Become a mod</h1>

      <Breadcrumbs
        prevRoutes={[
          { text: 'Contribute', href: '/contribute' },
          { text: 'Join us', href: '/contribute/join-us' },
        ]}
        currentRoute="Apply"
      />

      <p>
        In order to be accepted as a mod, you must have and use a Telegram account. We use
        telegram for communication and announcements for mods. If you do not have a
        telegram account, or if the username you enter doesn't work, you will not be
        accepted.
      </p>

      {hasExistingApplication && (
        <InfoBox
          variant="info"
          showIcon
          text="You already have an existing application. You can see the status of your application on your Account page."
          className="my-4"
        />
      )}

      {!hasExistingApplication && (
        <TopGradientBox containerClassName="w-fit mx-auto my-4" innerClassName="p-8 pb-4">
          <fetcher.Form className="w-fit mx-auto flex flex-col">
            <TextareaUncontrolled
              name="notes"
              label="Briefly tell us why you want to be a mod, and what sources you use for finding comics (which websites):"
              className="mb-12"
              validatorFunc={v => v.length > 0}
              onErrorChange={hasError => setNotesIsValid(!hasError)}
            />

            <TextInputUncontrolled
              name="telegram"
              label="Telegram username (don't include the @):"
              type="text"
              className="mb-4"
              validatorFunc={validateTelegramUsername}
              onErrorChange={hasError => setTelegramIsValid(!hasError)}
            />

            {fetcher.isError && !fetcher.isLoading && (
              <InfoBox
                variant="error"
                text={fetcher.errorMessage}
                showIcon
                closable
                className="my-4"
              />
            )}

            <div className="flex">
              <LoadingButton
                text="Submit application"
                color="primary"
                variant="contained"
                className="my-4 mx-auto"
                disabled={!notesIsValid || !telegramIsValid}
                isLoading={fetcher.isLoading}
                isSubmit
              />
            </div>
          </fetcher.Form>
        </TopGradientBox>
      )}
    </div>
  );
}

export async function loader(args: LoaderFunctionArgs) {
  const user = await redirectIfNotLoggedIn(args);

  const existingApplicationRes = await getModApplicationForUser(
    args.context.cloudflare.env.DB,
    user.userId
  );

  if (existingApplicationRes.err) {
    return processApiError('Error in join us - apply', existingApplicationRes.err);
  }

  return { hasExistingApplication: existingApplicationRes.result !== null };
}

const validateTelegramUsername = (username: string) =>
  /^([a-zA-Z0-9_]){4,32}$/.test(username);

export async function action(args: ActionFunctionArgs) {
  const db = args.context.cloudflare.env.DB;
  const reqBody = await args.request.formData();
  const { notes, telegram } = Object.fromEntries(reqBody);

  if (!notes || !telegram) return create400Json('Missing fields');
  if (!validateTelegramUsername(telegram as string))
    return create400Json('Invalid telegram username');

  const user = await authLoader(args);
  if (!user) return create400Json('Not logged in');

  const existingApplicationRes = await getModApplicationForUser(db, user.userId);
  if (existingApplicationRes.err) {
    logApiError('Error creating mod application', existingApplicationRes.err);
    return create500Json();
  }

  if (existingApplicationRes.result !== null) {
    return create400Json('You already have an existing application');
  }

  const insertQuery = `
    INSERT INTO modapplication (userId, telegramUsername, notes)
    VALUES (?, ?, ?)`;
  const insertParams = [user.userId, telegram.toString().trim(), notes];

  const insertDbRes = await queryDbExec(
    db,
    insertQuery,
    insertParams,
    'Mod application creation'
  );
  if (insertDbRes.isError) {
    logApiError(undefined, {
      logMessage: 'Error creating mod application',
      error: insertDbRes,
      context: { userId: user.userId, notes, telegram },
    });
    return create500Json();
  }
  return createSuccessJson();
}
