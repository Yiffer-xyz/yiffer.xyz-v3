import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { redirectIfNotMod } from '~/utils/loaders';
import {
  create400Json,
  createSuccessJson,
  noGetRoute,
  processApiError,
} from '~/utils/request-helpers';

export { noGetRoute as loader };

export async function action(args: ActionFunctionArgs) {
  await redirectIfNotMod(args);

  const formDataBody = await args.request.formData();
  const formComicName = formDataBody.get('comicName');
  if (!formComicName) return create400Json('Missing comicName');
  const comicName = formComicName.toString();

  const r2 = args.context.cloudflare.env.COMICS_BUCKET;

  try {
    const files = await r2.list({
      prefix: `${comicName}/`,
    });

    const fileObjects = files.objects.map(o => ({
      key: o.key.replace(`${comicName}/`, ''),
      size: o.size,
    }));

    return createSuccessJson(fileObjects);
  } catch (err: any) {
    return processApiError('Error in /list-comic-files', err, { comicName });
  }
}
