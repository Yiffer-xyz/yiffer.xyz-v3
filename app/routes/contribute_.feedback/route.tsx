import { Form, useActionData, useLoaderData, useNavigation } from '@remix-run/react';
import { useState } from 'react';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import InfoBox from '~/ui-components/InfoBox';
import RadioButtonGroup from '~/ui-components/RadioButton/RadioButtonGroup';
import Textarea from '~/ui-components/Textarea/Textarea';
import TopGradientBox from '~/ui-components/TopGradientBox';
import { queryDbExec } from '~/utils/database-facade';
import { authLoader } from '~/utils/loaders';
import {
  create400Json,
  create500Json,
  createSuccessJson,
  logApiError,
} from '~/utils/request-helpers';
import type { FeedbackType } from '~/types/types';
import Breadcrumbs from '~/ui-components/Breadcrumbs/Breadcrumbs';
import type { ActionFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { isMaliciousString } from '~/utils/string-utils';
export { YifferErrorBoundary as ErrorBoundary } from '~/utils/error';

export { authLoader as loader };

export const meta: MetaFunction = () => {
  return [{ title: `Feedback | Yiffer.xyz` }];
};

export default function Feedback() {
  const userSession = useLoaderData<typeof authLoader>();
  const transition = useNavigation();
  const actionData = useActionData<typeof action>();
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState<FeedbackType | undefined>();

  const radioOptions: { text: string; value: FeedbackType }[] = [
    { text: 'General feedback', value: 'general' },
    { text: 'Bug report', value: 'bug' },
  ];
  if (userSession) {
    radioOptions.push({ text: 'Support', value: 'support' });
  }

  return (
    <div className="container mx-auto pb-8">
      <h1>Feedback &amp; Support</h1>

      <Breadcrumbs
        prevRoutes={[{ text: 'Contribute', href: '/contribute' }]}
        currentRoute="Feedback & Support"
      />

      <TopGradientBox containerClassName="mt-6 shadow-lg max-w-2xl">
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
                  boldText={false}
                />
              )}
              {feedbackType === 'bug' && (
                <InfoBox
                  variant="info"
                  showIcon
                  text="Please report any crashes or obvious errors here. Do not use this to request new features - use the general feedback option above for that."
                  className="mb-4"
                  disableElevation
                  boldText={false}
                />
              )}
              {feedbackType === 'general' && (
                <InfoBox
                  variant="info"
                  showIcon
                  text="Please note that we will not answer any questions."
                  className="mb-4"
                  disableElevation
                  boldText={false}
                />
              )}

              <Textarea
                label="Your feedback"
                name="feedbackText"
                value={feedback}
                onChange={setFeedback}
                className="mb-2 mt-6"
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
    </div>
  );
}

export async function action(args: ActionFunctionArgs) {
  const reqBody = await args.request.formData();
  const { feedbackText, feedbackType } = Object.fromEntries(reqBody);

  if (isMaliciousString(feedbackText as string)) {
    return create400Json('Malicious input detected');
  }

  const user = await authLoader(args);
  let userIp = null;
  let userId = null;
  if (user) {
    userId = user.userId;
  } else {
    userIp = args.request.headers.get('CF-Connecting-IP') || 'unknown';
  }

  const insertQuery =
    'INSERT INTO feedback (text, type, userId, userIp) VALUES (?, ?, ?, ?)';
  const insertParams = [feedbackText, feedbackType, userId, userIp];

  const dbRes = await queryDbExec(
    args.context.cloudflare.env.DB,
    insertQuery,
    insertParams,
    'Feedback submission'
  );
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
