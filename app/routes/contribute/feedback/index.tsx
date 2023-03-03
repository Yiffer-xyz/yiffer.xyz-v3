import type { ActionFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { Form, useActionData, useTransition } from '@remix-run/react';
import { useState } from 'react';
import LoadingButton from '~/components/Buttons/LoadingButton';
import InfoBox from '~/components/InfoBox';
import Textarea from '~/components/Textarea/Textarea';
import TopGradientBox from '~/components/TopGradientBox';
import { getUserSession } from '~/utils/auth.server';
import { queryDbDirect } from '~/utils/database-facade';
import BackToContribute from '../BackToContribute';

export const action: ActionFunction = async function ({ request, context }) {
  const reqBody = await request.formData();
  const urlBase = context.DB_API_URL_BASE as string;
  const { feedbackText } = Object.fromEntries(reqBody);
  const user = await getUserSession(request, context.JWT_CONFIG_STR as string);

  let insertQuery = 'INSERT INTO feedback (Text, UserId) VALUES (?, ?)';
  const insertParams = [feedbackText, user?.userId ?? null];

  await queryDbDirect(urlBase, insertQuery, insertParams);
  return json({ success: true });
};

export default function Feedback() {
  const transition = useTransition();
  const actionData = useActionData();
  const [feedback, setFeedback] = useState('');

  return (
    <section className="container mx-auto justify-items-center">
      <h1 className="mb-2">Feedback</h1>
      <p className="mb-4">
        <BackToContribute />
      </p>

      <p>
        Thank you for taking the time to help improve our site! Note that we can not reply
        to your message - if you need assistance or have any questions, you should send an
        email to contact@yiffer.xyz instead.
      </p>

      <TopGradientBox containerClassName="my-10 mx-auto shadow-lg max-w-2xl">
        <Form method="post" className="mx-8 py-6">
          <h3 className="pb-6">Submit feedback</h3>
          {actionData?.error && (
            <InfoBox variant="error" text={actionData.error} className="my-2" />
          )}

          {actionData?.success ? (
            <InfoBox variant="success" text="Thank you for your feedback!" />
          ) : (
            <>
              <Textarea
                label="Your feedback"
                name="feedbackText"
                className="pb-6"
                value={feedback}
                onChange={setFeedback}
              />
              <LoadingButton
                isLoading={transition.state === 'submitting'}
                text="Submit feedback"
                variant="contained"
                color="primary"
                disabled={feedback.length < 3}
                className="mx-auto"
              />
            </>
          )}
        </Form>
      </TopGradientBox>
    </section>
  );
}
