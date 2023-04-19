import type { ActionArgs } from '@remix-run/cloudflare';
import { Form, useActionData, useLoaderData, useTransition } from '@remix-run/react';
import { useState } from 'react';
import LoadingButton from '~/components/Buttons/LoadingButton';
import InfoBox from '~/components/InfoBox';
import RadioButtonGroup from '~/components/RadioButton/RadioButtonGroup';
import Textarea from '~/components/Textarea/Textarea';
import TopGradientBox from '~/components/TopGradientBox';
import { getUserSession } from '~/utils/auth.server';
import { queryDb } from '~/utils/database-facade';
import { authLoader } from '~/utils/loaders';
import { create500Json, createSuccessJson, logApiError } from '~/utils/request-helpers';
import BackToContribute from '../BackToContribute';

export { authLoader as loader };

type FeedbackType = 'bug' | 'general' | 'support';

export default function Feedback() {
  const userSession = useLoaderData<typeof authLoader>();
  const transition = useTransition();
  const actionData = useActionData();
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState<FeedbackType | undefined>();

  let radioOptions: { text: string; value: FeedbackType }[] = [
    { text: 'General feedback', value: 'general' },
    { text: 'Bug report', value: 'bug' },
  ];
  if (userSession) {
    radioOptions.push({ text: 'Support', value: 'support' });
  }

  return (
    <section className="container mx-auto justify-items-center">
      <h1 className="mb-2">Feedback &amp; Support</h1>
      <p className="mb-4">
        <BackToContribute />
      </p>

      <TopGradientBox containerClassName="my-10 mx-auto shadow-lg max-w-2xl">
        <Form method="post" className="mx-8 py-6">
          <h3>Submit feedback</h3>

          {actionData?.success ? (
            <InfoBox
              variant="success"
              text={
                feedbackType === 'support'
                  ? 'Your support request has been submitted. We will look at it as soon as possible. If we deem it necessary, we will contact you via the email associated with your account.'
                  : 'Your feedback has been submitted. Thank you!'
              }
              className="mt-4"
              disableElevation
            />
          ) : (
            <>
              <RadioButtonGroup
                name="feedbackType"
                title="Type of feedback"
                className="mb-4 mt-2"
                value={feedbackType}
                onChange={setFeedbackType}
                options={radioOptions}
              />

              {feedbackType === 'support' && (
                <InfoBox
                  variant="info"
                  showIcon
                  text="Please do not use the support feature to ask questions. We will only respond to support requests if you have an issue that requires our attention. If we deem it necessary, we will contact you via the email associated with your account."
                  className="mb-4"
                  disableElevation
                />
              )}
              {feedbackType === 'bug' && (
                <InfoBox
                  variant="info"
                  showIcon
                  text="Please report any crashes or obvious errors here. Do not use this to request new features - use the general feedback option above for that."
                  className="mb-4"
                  disableElevation
                />
              )}
              {feedbackType === 'general' && (
                <InfoBox
                  variant="info"
                  showIcon
                  text="Please note that we will not answer any questions."
                  className="mb-4"
                  disableElevation
                />
              )}

              <Textarea
                label="Your feedback"
                name="feedbackText"
                value={feedback}
                onChange={setFeedback}
                className="mb-2"
              />

              {actionData?.error && (
                <InfoBox
                  variant="error"
                  text="An error occurred when saving your feedback. Please try again!"
                  className="my-4"
                />
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

export async function action(args: ActionArgs) {
  const reqBody = await args.request.formData();
  const urlBase = args.context.DB_API_URL_BASE;
  const { feedbackText, feedbackType } = Object.fromEntries(reqBody);
  const user = await getUserSession(args.request, args.context.JWT_CONFIG_STR);

  let insertQuery = 'INSERT INTO feedback (text, type, userId) VALUES (?, ?, ?)';
  const insertParams = [feedbackText, feedbackType, user?.userId ?? null];

  const dbRes = await queryDb(urlBase, insertQuery, insertParams);
  if (dbRes.isError) {
    logApiError(undefined, {
      logMessage: 'Error saving user feedback',
      error: dbRes,
      context: { feedbackText, feedbackType, user: user?.userId },
    });
    return create500Json();
  }
  return createSuccessJson();
}
