import { ActionArgs } from '@remix-run/cloudflare';
import { redirectIfNotMod } from '~/utils/loaders';
import {
  create500Json,
  createGeneric500Json,
  createSuccessJson,
} from '~/utils/request-helpers';
import { recalculatePublishingQueue } from '../funcs/publishing-queue';

export async function action(args: ActionArgs) {
  await redirectIfNotMod(args);
  const urlBase = args.context.DB_API_URL_BASE as string;

  try {
    await recalculatePublishingQueue(urlBase);
  } catch (e) {
    return e instanceof Error ? create500Json(e.message) : createGeneric500Json();
  }

  return createSuccessJson();
}
