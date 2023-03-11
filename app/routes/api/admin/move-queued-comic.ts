import { ActionArgs } from '@remix-run/cloudflare';
import { redirectIfNotMod } from '~/utils/loaders';
import {
  create400Json,
  create500Json,
  createGeneric500Json,
  createSuccessJson,
} from '~/utils/request-helpers';
import { moveComicInQueue, recalculatePublishingQueue } from '../funcs/publishing-queue';

export async function action(args: ActionArgs) {
  await redirectIfNotMod(args);
  const urlBase = args.context.DB_API_URL_BASE as string;

  const formDataBody = await args.request.formData();

  const formComicId = formDataBody.get('comicId');
  if (!formComicId) return create400Json('Missing comicId');

  const formMoveDirection = formDataBody.get('direction');
  if (formMoveDirection !== 'up' && formMoveDirection !== 'down') {
    return create400Json('Missing direction, needs to be up or down');
  }

  try {
    await moveQueuedComic(urlBase, parseInt(formComicId.toString()), formMoveDirection);
  } catch (e) {
    return e instanceof Error ? create500Json(e.message) : createGeneric500Json();
  }

  return createSuccessJson();
}

export async function moveQueuedComic(
  urlBase: string,
  comicId: number,
  direction: 'up' | 'down'
) {
  await moveComicInQueue(urlBase, comicId, direction === 'up' ? -1 : 1);
  return;
}
