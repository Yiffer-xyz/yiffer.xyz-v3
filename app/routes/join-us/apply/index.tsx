import type { ActionFunction} from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { Form, useActionData } from '@remix-run/react';
import { useState } from 'react';
import { MdArrowBack } from "react-icons/md";
import LoadingButton from '~/components/Buttons/LoadingButton';
import InfoBox from '~/components/InfoBox';
import Link from "~/components/Link";
import TextInputUncontrolled from '~/components/TextInput/TextInputUncontrolled';
import TopGradientBox from '~/components/TopGradientBox';

const validateTelegramUsername = (username: string) => username.length > 5 && username.length <= 32

export const action: ActionFunction = async function ({ request }) {
  const reqBody = await request.formData();
  const { notes, telegram } = Object.fromEntries(reqBody);

  const fields = { notes, telegram };

  const response = await fetch('https://yiffer.xyz/api/mod-applications', {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    body: reqBody,
  });
  if (!response.ok) {
    return json({ error: await response.text(), fields }, { status: response.status });
  }

  return response;
};

export default function Apply() {
  const actionData = useActionData();
  const [notesHasContent, setNotesHasContent] = useState(false);
  const [telegramHasContent, setTelegramHasContent] = useState(false);

  return (
    <div className="container mx-auto">
      <h1>Become a mod</h1>
      <p className="mb-4">
        <Link href="/join-us" text="Back" Icon={MdArrowBack} />
      </p>

      <p className="mb-4">
        In order to be accepted as a mod, you must have and use a Telegram account.
        We use telegram for communication and announcements for mods. If you do not
        have an account, you will not be accepted.
      </p>

      <TopGradientBox className="dark:bg-bgDark">
        <Form method="post" className="w-fit mx-auto">
          <h3 className="text-3xl font-bold">Mod application form</h3>

          <TextInputUncontrolled
            name="notes"
            label="Tell us a little about why you want to be a mod, and what sources you use for finding comics (which websites):"
            type="text"
            className="mb-6 mt-4"
            onChange={(e) => setNotesHasContent(e.length > 0)}
          />

          <TextInputUncontrolled
            name="telegram"
            label="Telegram username:"
            type="text"
            className="mb-6"
            onChange={(e) => setTelegramHasContent(validateTelegramUsername(e))}
          />

          {actionData?.error && (
            <InfoBox variant="error" text={actionData.error} className="my-2" />
          )}

          <div className="flex">
            <LoadingButton
              text="Submit application"
              color="primary"
              variant="contained"
              className="my-2" // TODO: use disabled prop whenever it gets implemented
              isLoading={false}
            />
          </div>

        </Form>
      </TopGradientBox>
    </div>
  );
}
