import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { getAllFeedback } from '~/route-funcs/get-feedback';
import { processApiError } from '~/utils/request-helpers';

export async function loader(args: LoaderFunctionArgs) {
  const urlBase = args.context.DB_API_URL_BASE;
  const feedbackRes = await getAllFeedback(urlBase);
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

      {feedback.map(feedback => (
        <div key={feedback.timestamp} className="mb-8">
          <pre>{JSON.stringify(feedback, null, 2)}</pre>
        </div>
      ))}
    </>
  );
}
