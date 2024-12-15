import { redirectIfNotMod } from '~/utils/loaders';
import { createSuccessJson, noGetRoute, processApiError } from '~/utils/request-helpers';
import { recalculatePublishingQueue } from '~/route-funcs/publishing-queue';
import type { ActionFunctionArgs } from '@remix-run/cloudflare';

export { noGetRoute as loader };

export async function action(args: ActionFunctionArgs) {
  await redirectIfNotMod(args);
  const err = await recalculatePublishingQueue(args.context.cloudflare.env.DB);
  if (err) {
    return processApiError('Error recalculating publishing queue from API endpoint', err);
  }
  return createSuccessJson();
}
