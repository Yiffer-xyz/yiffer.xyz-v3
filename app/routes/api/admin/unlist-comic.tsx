import { ActionArgs } from '@remix-run/cloudflare';
import { DBResponse, queryDb } from '~/utils/database-facade';
import { redirectIfNotMod } from '~/utils/loaders';
import {
  ApiError,
  create400Json,
  createSuccessJson,
  makeDbErr,
  processApiError,
} from '~/utils/request-helpers';

export async function action(args: ActionArgs) {
  await redirectIfNotMod(args);
  const urlBase = args.context.DB_API_URL_BASE as string;

  const formDataBody = await args.request.formData();

  const formComicId = formDataBody.get('comicId');
  if (!formComicId) return create400Json('Missing comicId');

  const formUnlistComment = formDataBody.get('unlistComment');
  if (!formUnlistComment) return create400Json('Missing comment');

  const err = await unlistComic(
    urlBase,
    parseInt(formComicId.toString()),
    formUnlistComment.toString()
  );

  if (err) {
    return processApiError('Error in /unlist-comic', err);
  }
  return createSuccessJson();
}

export async function unlistComic(
  urlBase: string,
  comicId: number,
  unlistComment: string
): Promise<ApiError | undefined> {
  const logCtx = { comicId, unlistComment };
  const getDetailsQuery = 'SELECT comicId FROM comicmetadata WHERE comicId = ?';
  const comicUpdateQuery = `UPDATE comic SET publishStatus = 'unlisted' WHERE id = ?`;

  const [detailsDbRes, updateDbRes] = await Promise.all([
    queryDb<any[]>(urlBase, getDetailsQuery, [comicId]),
    queryDb(urlBase, comicUpdateQuery, [comicId]),
  ]);

  if (detailsDbRes.isError) {
    return makeDbErr(detailsDbRes, 'Could not get metadata', logCtx);
  }
  if (updateDbRes.isError) {
    return makeDbErr(updateDbRes, 'Could not update publishStatus', logCtx);
  }

  let metadataDbRes: DBResponse<any>;
  if (detailsDbRes.result?.length === 0) {
    const insertQuery =
      'INSERT INTO comicmetadata (comicId, unlistComment) VALUES (?, ?)';
    metadataDbRes = await queryDb(urlBase, insertQuery, [comicId, unlistComment]);
  } else {
    const updateQuery = 'UPDATE comicmetadata SET unlistComment = ? WHERE comicId = ?';
    metadataDbRes = await queryDb(urlBase, updateQuery, [unlistComment, comicId]);
  }

  if (metadataDbRes.isError) {
    return makeDbErr(metadataDbRes, 'Could not insert/update comicmetadata', logCtx);
  }
}
