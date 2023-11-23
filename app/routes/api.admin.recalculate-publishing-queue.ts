import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { redirectIfNotMod } from '~/utils/loaders';
import { createSuccessJson, processApiError } from '~/utils/request-helpers';
import { recalculatePublishingQueue } from '~/route-funcs/publishing-queue';

export async function action(args: ActionFunctionArgs) {
  await redirectIfNotMod(args);
  const urlBase = args.context.DB_API_URL_BASE;

  const err = await recalculatePublishingQueue(urlBase);
  if (err) {
    return processApiError('Error recalculating publishing queue from API endpoint', err);
  }
  return createSuccessJson();
}
