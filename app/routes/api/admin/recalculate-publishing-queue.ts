import type { Route } from './+types/recalculate-publishing-queue';
import { redirectIfNotMod } from '~/utils/loaders';
import { createSuccessJson, noGetRoute, processApiError } from '~/utils/request-helpers';
import { recalculatePublishingQueue } from '~/route-funcs/publishing-queue';

export { noGetRoute as loader };

export async function action(args: Route.ActionArgs) {
  await redirectIfNotMod(args);
  const err = await recalculatePublishingQueue(args.context.cloudflare.env.DB);
  if (err) {
    return processApiError('Error recalculating publishing queue from API endpoint', err);
  }
  return createSuccessJson();
}
