import { useLoaderData } from '@remix-run/react';
import { getAllFeedback } from '~/route-funcs/get-feedback';
import { processApiError } from '~/utils/request-helpers';
import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
export { AdminErrorBoundary as ErrorBoundary } from '~/utils/error';

export async function loader(args: LoaderFunctionArgs) {
  const feedbackRes = await getAllFeedback(args.context.cloudflare.env.DB);
  if (feedbackRes.err) {
    return processApiError('Error getting data in admin feedback route', feedbackRes.err);
  }

  return { feedback: feedbackRes.result };
}

export default function AdminFeedback() {
  const { feedback } = useLoaderData<typeof loader>();

  return (
    <>
      <h1>Feedback and support</h1>
      <p className="font-bold">ℹ️ See the figma prototype.</p>

      {feedback.map(feedback => (
        <div key={feedback.id} className="my-4">
          <pre>{JSON.stringify(feedback, null, 2)}</pre>
        </div>
      ))}
    </>
  );
}
