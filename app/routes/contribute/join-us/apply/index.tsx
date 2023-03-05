import { ActionArgs, LoaderArgs, redirect } from '@remix-run/cloudflare';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { useState } from 'react';
import { MdArrowBack } from 'react-icons/md';
import LoadingButton from '~/components/Buttons/LoadingButton';
import InfoBox from '~/components/InfoBox';
import Link from '~/components/Link';
import TextareaUncontrolled from '~/components/Textarea/TextareaUncontrolled';
import TextInputUncontrolled from '~/components/TextInput/TextInputUncontrolled';
import TopGradientBox from '~/components/TopGradientBox';
import { getModApplicationForUser } from '~/routes/api/funcs/get-mod-application';
import { queryDb } from '~/utils/database-facade';
import { authLoader } from '~/utils/loaders';
import {
  create400Json,
  createGeneric500Json,
  createSuccessJson,
  ErrorCodes,
} from '~/utils/request-helpers';

export async function loader(args: LoaderArgs) {
  const user = await authLoader(args);
  if (!user.user) throw redirect('/');

  const existingApplication = await getModApplicationForUser(
    args.context.DB_API_URL_BASE as string,
    user.user.userId
  );

  return { hasExistingApplication: existingApplication !== null };
}

const validateTelegramUsername = (username: string) =>
  /^([a-zA-Z0-9_]){5,32}$/.test(username);

export async function action(args: ActionArgs) {
  const urlBase = args.context.DB_API_URL_BASE as string;
  const reqBody = await args.request.formData();
  const { notes, telegram } = Object.fromEntries(reqBody);

  if (!notes || !telegram) return create400Json('Missing fields');
  if (!validateTelegramUsername(telegram as string))
    return create400Json('Invalid telegram username');

  const user = await authLoader(args);
  if (!user.user) return create400Json('Not logged in');

  const existingApplication = await getModApplicationForUser(urlBase, user.user.userId);
  if (existingApplication) {
    return create400Json('You already have an existing application');
  }

  const insertQuery = `
    INSERT INTO modapplication (userId, telegramUsername, notes)
    VALUES (?, ?, ?)`;
  const insertParams = [user.user.userId, telegram, notes];

  const insertResult = await queryDb(urlBase, insertQuery, insertParams);
  if (insertResult.errorMessage) {
    return createGeneric500Json(ErrorCodes.EXISTING_MODAPPL_SUMIT);
  }

  return createSuccessJson();
}

export default function Apply() {
  const fetcher = useFetcher();
  const { hasExistingApplication } = useLoaderData<typeof loader>();
  const [notesIsValid, setNotesIsValid] = useState(false);
  const [telegramIsValid, setTelegramIsValid] = useState(false);

  return (
    <div className="container mx-auto">
      <h1>Become a mod</h1>
      <p className="mb-4">
        <Link href="/contribute/join-us" text="Back" Icon={MdArrowBack} />
      </p>

      <p>
        In order to be accepted as a mod, you must have and use a Telegram account. We use
        telegram for communication and announcements for mods. If you do not have a
        telegram account, you will not be accepted.
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
          <fetcher.Form method="post" className="w-fit mx-auto flex flex-col">
            {fetcher.data?.success ? (
              <InfoBox
                variant="success"
                text="Success! We will contact you if we decide to take you in. You can see the status of your application on your Account page. Thank you!"
                className="my-4"
              />
            ) : (
              <>
                <TextareaUncontrolled
                  name="notes"
                  label="Tell us a little about why you want to be a mod, and what sources you use for finding comics (which websites):"
                  className="mb-12"
                  validatorFunc={v => v.length > 0}
                  onErrorChange={hasError => setNotesIsValid(!hasError)}
                />

                <TextInputUncontrolled
                  name="telegram"
                  label="Telegram username (don't include the @ symbol):"
                  type="text"
                  className="mb-4"
                  validatorFunc={validateTelegramUsername}
                  onErrorChange={hasError => setTelegramIsValid(!hasError)}
                />

                {fetcher.data?.error && fetcher.state === 'idle' && (
                  <InfoBox
                    variant="error"
                    text={fetcher.data.error}
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
                    isLoading={fetcher.state !== 'idle'}
                    onClick={() => {}}
                  />
                </div>
              </>
            )}
          </fetcher.Form>
        </TopGradientBox>
      )}
    </div>
  );
}
