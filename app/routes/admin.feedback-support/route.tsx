import { useLoaderData } from '@remix-run/react';
import { getFeedback } from '~/route-funcs/get-feedback';
import { processApiError } from '~/utils/request-helpers';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import FeedbackItem from '~/page-components/UserFeedback/FeedbackItem';
import { useState } from 'react';
import ToggleButton from '~/ui-components/Buttons/ToggleButton';
export { AdminErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction = () => {
  return [{ title: `Mod: Feedback/support | Yiffer.xyz` }];
};

export async function loader(args: LoaderFunctionArgs) {
  const feedbackRes = await getFeedback({ db: args.context.cloudflare.env.DB });
  if (feedbackRes.err) {
    return processApiError('Error getting data in admin feedback route', feedbackRes.err);
  }

  return { feedback: feedbackRes.result };
}

export default function AdminFeedback() {
  const { feedback } = useLoaderData<typeof loader>();

  const [toggleState, setToggleState] = useState<'unprocessed' | 'archived'>(
    'unprocessed'
  );

  const feedbackToShow =
    toggleState === 'unprocessed'
      ? feedback.filter(f => !f.isArchived)
      : feedback.filter(f => f.isArchived);

  return (
    <>
      <h1>Feedback & Support</h1>

      <ToggleButton
        className="my-4"
        buttons={[
          { text: 'Unprocessed', value: 'unprocessed' },
          { text: 'Archived', value: 'archived' },
        ]}
        onChange={setToggleState}
        value={toggleState}
      />

      <section className="max-w-2xl">
        <p>
          To respond to support requests, go to the user's profile and send them an email
          via their account's associated address. Make sure to archive the issue here
          immediately, to prevent other mods from doing the same.
        </p>

        {feedbackToShow.map(feedback => (
          <div key={feedback.id} className="my-4">
            <FeedbackItem feedback={feedback} />
          </div>
        ))}
      </section>
    </>
  );
}
