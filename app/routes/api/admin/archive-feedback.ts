import type { Route } from './+types/archive-feedback';
import { parseFormJson } from '~/utils/formdata-parser';
import { archiveFeedback } from '~/route-funcs/archive-feedback';
import { createSuccessJson, processApiError } from '~/utils/request-helpers';

export type ArchiveFeedbackBody = {
  feedbackId: number;
};

export async function action(args: Route.ActionArgs) {
  const { fields, isUnauthorized } = await parseFormJson<ArchiveFeedbackBody>(
    args,
    'admin'
  );

  if (isUnauthorized) return new Response('Unauthorized', { status: 401 });

  const err = await archiveFeedback(args.context.cloudflare.env.DB, fields.feedbackId);

  if (err) {
    return processApiError('Error archiving feedback', err, {
      ...fields,
    });
  }

  return createSuccessJson();
}
