import type { ActionFunction } from '@remix-run/cloudflare';
import { Form, useActionData, useTransition } from '@remix-run/react';
import { useState } from 'react';
import LoadingButton from '~/components/Buttons/LoadingButton';
import InfoBox from '~/components/InfoBox';
import RadioButtonGroupUncontrolled from '~/components/RadioButton/RadioButtonGroupUncontrolled';
import Textarea from '~/components/Textarea/Textarea';
import TopGradientBox from '~/components/TopGradientBox';
import { getUserSession } from '~/utils/auth.server';
import { queryDb } from '~/utils/database-facade';
import { create400Json, createSuccessJson, logError } from '~/utils/request-helpers';
import BackToContribute from '../BackToContribute';

export const action: ActionFunction = async function ({ request, context }) {
  const reqBody = await request.formData();
  const urlBase = context.DB_API_URL_BASE as string;
  const { feedbackText, feedbackType } = Object.fromEntries(reqBody);
  const user = await getUserSession(request, context.JWT_CONFIG_STR as string);

  let insertQuery = 'INSERT INTO feedback (text, type, userId) VALUES (?, ?, ?)';
  const insertParams = [feedbackText, feedbackType, user?.userId ?? null];

  const dbRes = await queryDb(urlBase, insertQuery, insertParams);
  if (dbRes.errorMessage) {
    logError(
      `Error inserting feedback. User: ${user?.userId ?? 'null'}, text: ${feedbackText}`,
      dbRes
    );
    return create400Json('Error saving feedback');
  }

  return createSuccessJson();
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
          <h3>Submit feedback</h3>

          {actionData?.success ? (
            <InfoBox
              variant="success"
              text="Thank you for your feedback!"
              className="mt-2"
              disableElevation
            />
          ) : (
            <>
              <RadioButtonGroupUncontrolled
                name="feedbackType"
                title="Type of feedback"
                className="mb-6 mt-2"
                options={[
                  { text: 'Bug report', value: 'bug' },
                  { text: 'General feedback', value: 'general' },
                ]}
              />

              <Textarea
                label="Your feedback"
                name="feedbackText"
                value={feedback}
                onChange={setFeedback}
                className="mb-2"
              />

              {actionData?.error && (
                <InfoBox variant="error" text={actionData.error} className="my-4" />
              )}

              <LoadingButton
                isLoading={transition.state === 'submitting'}
                text="Submit feedback"
                variant="contained"
                color="primary"
                disabled={feedback.length < 3}
                className="mx-auto mt-2"
                isSubmit
              />
            </>
          )}
        </Form>
      </TopGradientBox>
    </section>
  );
}
