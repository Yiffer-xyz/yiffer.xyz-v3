import { parseFormJson } from '~/utils/formdata-parser';
import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { createSuccessJson, processApiError } from '~/utils/request-helpers';
import { deleteFeedback } from '~/route-funcs/delete-feedback';

export type DeleteFeedbackBody = {
  feedbackId: number;
};

export async function action(args: ActionFunctionArgs) {
  const { fields, isUnauthorized } = await parseFormJson<DeleteFeedbackBody>(
    args,
    'admin'
  );

  if (isUnauthorized) return new Response('Unauthorized', { status: 401 });

  const err = await deleteFeedback(args.context.cloudflare.env.DB, fields.feedbackId);

  if (err) {
    return processApiError('Error deleting feedback', err, {
      ...fields,
    });
  }

  return createSuccessJson();
}
