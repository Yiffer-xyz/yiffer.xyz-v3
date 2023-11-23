import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { create500Json, createSuccessJson } from '~/utils/request-helpers';

export async function action(args: ActionFunctionArgs) {
  const bucket = args.context.COMICS_BUCKET;
  const body = await args.request.formData();
  const comicName = body.get('comicName');
  const allFiles = body.getAll('files');

  // For some reason, on server, files they come as Blob, not File.
  // This means they don't have the 'name' attribute.
  // However, it SEEMS that so far, thumbnail comes first, and then
  // the rest of the pages in order...
  try {
    const filePutPromises = allFiles.map(async (blob, i) => {
      if (blob instanceof File) {
        const fileContents = await blob.arrayBuffer();
        return bucket.put(`${comicName}/${blob.name}`, fileContents);
      }

      const filename = i === 0 ? 'thumbnail.jpg' : `${i.toString().padStart(3, '0')}.jpg`;
      const realBlob = new Blob([blob], { type: 'image/jpeg' });
      const arrayBuffer = await realBlob.arrayBuffer();
      return bucket.put(`${comicName}/${filename}`, arrayBuffer);
    });

    await Promise.all(filePutPromises);
  } catch (e: any) {
    console.error(e);
    return create500Json(
      `Files length: ${allFiles.length}.\n First file type: ${
        allFiles[0].constructor.name
      }. Or ${typeof allFiles[0]}. \n` +
        'Error uploading files: ' +
        e.message
    );
  }

  return createSuccessJson();
}
