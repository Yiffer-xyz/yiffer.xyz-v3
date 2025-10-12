import type { Route } from './+types/update-thumbnail';
import { redirectIfNotMod } from '~/utils/loaders';
import { type ApiError, noGetRoute } from '~/utils/request-helpers';
import {
  create400Json,
  createSuccessJson,
  processApiError,
} from '~/utils/request-helpers';
import { renameR2File } from '~/utils/r2Utils';
import { R2_COMICS_FOLDER, R2_TEMP_FOLDER } from '~/types/constants';
import { validateFormDataNumber } from '~/utils/string-utils';

export { noGetRoute as loader };

export async function action(args: Route.ActionArgs) {
  await redirectIfNotMod(args);

  const reqBody = await args.request.formData();
  const comicId = validateFormDataNumber(reqBody, 'comicId');
  const tempToken = reqBody.get('tempToken');
  if (!comicId || !tempToken) {
    return create400Json('Missing comicId or tempToken');
  }

  const err = await updateThumbnail(
    args.context.cloudflare.env.COMICS_BUCKET,
    args.context.cloudflare.env.DB,
    args.context.cloudflare.env.IMAGES_SERVER_URL,
    args.context.cloudflare.env.IS_LOCAL_DEV === 'true',
    Number(comicId),
    tempToken.toString()
  );
  if (err) {
    return processApiError('Error in /update-thumbnail', err, { comicId, tempToken });
  }
  return createSuccessJson();
}

export async function updateThumbnail(
  r2: R2Bucket,
  db: D1Database,
  imagesServerUrl: string,
  isLocalDev: boolean,
  comicId: number,
  tempToken: string
): Promise<ApiError | undefined> {
  try {
    const promises = ['-2x.jpg', '-2x.webp', '-3x.jpg', '-3x.webp'].map(suffix =>
      renameR2File({
        r2,
        imagesServerUrl,
        isLocalDev,
        oldKey: `${R2_TEMP_FOLDER}/${tempToken}${suffix}`,
        newKey: `${R2_COMICS_FOLDER}/${comicId}/thumbnail${suffix}`,
      })
    );

    await Promise.all(promises);
  } catch (err) {
    return {
      context: {
        err: err?.toString(),
      },
      logMessage: 'Error renaming temp thumbnail files',
    };
  }

  return;
}
