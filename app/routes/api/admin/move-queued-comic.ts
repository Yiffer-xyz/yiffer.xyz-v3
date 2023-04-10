import { ActionArgs } from '@remix-run/cloudflare';
import { redirectIfNotMod } from '~/utils/loaders';
import {
  create400Json,
  create500Json,
  createSuccessJson,
  logErrorOLD_DONOTUSE,
} from '~/utils/request-helpers';
import { moveComicInQueue } from '../funcs/publishing-queue';

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

  const err = await moveComicInQueue(
    urlBase,
    parseInt(formComicId.toString()),
    formMoveDirection === 'up' ? -1 : 1
  );
  if (err) {
    logErrorOLD_DONOTUSE('Error moving comic in queue', err);
    return create500Json(err.client400Message);
  }

  return createSuccessJson();
}
