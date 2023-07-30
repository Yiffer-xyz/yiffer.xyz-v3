import { ActionArgs } from '@remix-run/cloudflare';
import { createSuccessJson } from '~/utils/request-helpers';

export async function action(args: ActionArgs) {
  const bucket = args.context.COMICS_BUCKET;
  const body = await args.request.formData();
  const comicName = body.get('comicName');
  const allFiles = body.getAll('files') as File[];

  try {
    const filePutPromises = allFiles.map(async (file: File) => {
      const fileContents = await file.arrayBuffer();
      return bucket.put(`${comicName}/${file.name}`, fileContents);
    });

    await Promise.all(filePutPromises);
  } catch (e) {
    throw e;
  }

  return createSuccessJson();
}
