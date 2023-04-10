import { ActionArgs } from '@remix-run/cloudflare';
import { redirectIfNotMod } from '~/utils/loaders';
import {
  create500Json,
  createSuccessJson,
  logErrorOLD_DONOTUSE,
} from '~/utils/request-helpers';
import { recalculatePublishingQueue } from '../funcs/publishing-queue';

export async function action(args: ActionArgs) {
  await redirectIfNotMod(args);
  const urlBase = args.context.DB_API_URL_BASE as string;

  const err = await recalculatePublishingQueue(urlBase);
  if (err) {
    logErrorOLD_DONOTUSE('Error recalculating publishing queue from API endpoint', err);
    return create500Json(err.client400Message);
  }

  return createSuccessJson();
}
