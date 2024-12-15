import { redirectIfNotMod } from '~/utils/loaders';
import {
  create400Json,
  createSuccessJson,
  noGetRoute,
  processApiError,
} from '~/utils/request-helpers';
import { moveComicInQueue } from '~/route-funcs/publishing-queue';
import type { ActionFunctionArgs } from '@remix-run/cloudflare';

export { noGetRoute as loader };

export async function action(args: ActionFunctionArgs) {
  await redirectIfNotMod(args);

  const formDataBody = await args.request.formData();

  const formComicId = formDataBody.get('comicId');
  if (!formComicId) return create400Json('Missing comicId');

  const formMoveDirection = formDataBody.get('direction');
  if (formMoveDirection !== 'up' && formMoveDirection !== 'down') {
    return create400Json('Missing direction, needs to be up or down');
  }

  const err = await moveComicInQueue(
    args.context.cloudflare.env.DB,
    parseInt(formComicId.toString()),
    formMoveDirection === 'up' ? -1 : 1
  );
  if (err) {
    return processApiError('Error in /move-queued-comic', err, {
      comicId: formComicId,
      direction: formMoveDirection,
    });
  }

  return createSuccessJson();
}
