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
  const r2 = args.context.cloudflare.env.COMICS_BUCKET;

  const formDataBody = await args.request.formData();
  const formComicName = formDataBody.get('comicName');
  if (!formComicName) return create400Json('Missing comicName');
  const comicName = formComicName.toString();

  const formReplaceFrom = formDataBody.get('replaceFrom');
  if (!formReplaceFrom) return create400Json('Missing replaceFrom');
  const replaceFrom = formReplaceFrom.toString();
  const formReplaceTo = formDataBody.get('replaceTo');
  let replaceTo = '';
  if (formReplaceTo) {
    replaceTo = formReplaceTo.toString();
  }

  try {
    const files = await r2.list({
      prefix: `${comicName}/`,
    });

    let promises: Promise<void>[] = [];
    let counter = 0;
    for (const obj of files.objects) {
      if (obj.key.includes(replaceFrom)) {
        promises.push(renameR2File(r2, obj.key, obj.key.replace(replaceFrom, replaceTo)));
      }
      counter++;
      if (counter % 3 === 0) {
        await Promise.all(promises);
        promises = [];
      }
    }
    await Promise.all(promises);

    return createSuccessJson();
  } catch (err: any) {
    return processApiError('Error in /rename-comic-files', err, { comicName });
  }
}

async function renameR2File(r2: R2Bucket, oldKey: string, newKey: string) {
  const file = await r2.get(oldKey);
  if (!file) return;
  await r2.put(newKey, file.body);
  await r2.delete(oldKey);
}
