import { unstable_defineAction } from '@remix-run/cloudflare';
import { queryDbExec } from '~/utils/database-facade';
import { redirectIfNotMod } from '~/utils/loaders';
import type { ApiError, noGetRoute } from '~/utils/request-helpers';
import {
  create400Json,
  createSuccessJson,
  makeDbErr,
  processApiError,
} from '~/utils/request-helpers';

export { noGetRoute as loader };

export const action = unstable_defineAction(async args => {
  await redirectIfNotMod(args);

  const formDataBody = await args.request.formData();

  const formComicId = formDataBody.get('comicId');
  if (!formComicId) return create400Json('Missing comicId');

  const err = await publishComic(
    args.context.cloudflare.env.DB,
    parseInt(formComicId.toString())
  );
  if (err) {
    return processApiError('Error in /publish-comic', err, {
      comicId: formComicId,
    });
  }
  return createSuccessJson();
});

export async function publishComic(
  db: D1Database,
  comicId: number
): Promise<ApiError | undefined> {
  const query = `
    UPDATE comic
    SET publishStatus = 'published',
      published = CURRENT_TIMESTAMP,
      updated = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  const dbRes = await queryDbExec(db, query, [comicId]);
  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error publishing comic', { comicId });
  }
}
