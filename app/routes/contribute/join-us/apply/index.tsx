import { ActionFunction, json } from '@remix-run/cloudflare';
import { useFetcher } from '@remix-run/react';
import { useState } from 'react';
import { MdArrowBack } from 'react-icons/md';
import LoadingButton from '~/components/Buttons/LoadingButton';
import InfoBox from '~/components/InfoBox';
import Link from '~/components/Link';
import TextareaUncontrolled from '~/components/Textarea/TextareaUncontrolled';
import TextInputUncontrolled from '~/components/TextInput/TextInputUncontrolled';
import TopGradientBox from '~/components/TopGradientBox';
import { redirectNoAuth } from '~/utils/loaders';

export const loader = redirectNoAuth('/join-us');

const validateTelegramUsername = (username: string) =>
  /^([a-zA-Z0-9_]){5,32}$/.test(username);

export const action: ActionFunction = async function ({ request, context }) {
  const urlBase = context.URL_BASE;
  const reqBody = await request.formData();
  const { notes, telegram } = Object.fromEntries(reqBody);

  const fields = { notes, telegram };

  const response = await fetch(`${urlBase}/api/mod-applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data',
      cookie: request.headers.get('cookie') || '',
    },
    body: reqBody,
  });
  if (!response.ok) {
    return json({ error: await response.text(), fields }, { status: response.status });
  } else {
    return json({ success: true });
  }
};

export default function Apply() {
  const fetcher = useFetcher();
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
        telegram for communication and announcements for mods. If you do not have an
        account, you will not be accepted.
      </p>

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
    </div>
  );
}
