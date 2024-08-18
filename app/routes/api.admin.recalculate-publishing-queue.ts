import { redirectIfNotMod } from '~/utils/loaders';
import { createSuccessJson, processApiError } from '~/utils/request-helpers';
import { recalculatePublishingQueue } from '~/route-funcs/publishing-queue';
import { unstable_defineAction } from '@remix-run/cloudflare';

export const action = unstable_defineAction(async args => {
  await redirectIfNotMod(args);
  const err = await recalculatePublishingQueue(args.context.cloudflare.env.DB);
  if (err) {
    return processApiError('Error recalculating publishing queue from API endpoint', err);
  }
  return createSuccessJson();
});
