import { ActionArgs, json } from '@remix-run/cloudflare';
import { ComicUploadVerdict } from '~/types/types';
import { queryDbDirect } from '~/utils/database-facade';
import { randomString } from '~/utils/general';
import { redirectIfNotMod } from '~/utils/loaders';
import {
  create400Json,
  create500Json,
  createGeneric500Json,
  createSuccessJson,
} from '~/utils/request-helpers';

export async function action(args: ActionArgs) {
  await redirectIfNotMod(args);
  const urlBase = args.context.DB_API_URL_BASE as string;

  const formDataBody = await args.request.formData();

  const formComicId = formDataBody.get('comicId');
  if (!formComicId) return create400Json('Missing comicId');
  const formVerdict = formDataBody.get('verdict');
  if (!formVerdict) return create400Json('Missing verdict');
  const formComicName = formDataBody.get('comicName');
  if (!formComicName) return create400Json('Missing comicName');

  const verdict: ComicUploadVerdict = formVerdict.toString() as ComicUploadVerdict;
  const formModComment = formDataBody.get('modComment');
  const modComment = formModComment ? formModComment.toString() : undefined;

  try {
    await processUserUpload(
      urlBase,
      parseInt(formComicId.toString()),
      formComicName.toString(),
      verdict,
      modComment
    );
  } catch (e) {
    return e instanceof Error ? create500Json(e.message) : createGeneric500Json();
  }

  return createSuccessJson();
}

export async function processUserUpload(
  urlBase: string,
  comicId: number,
  comicName: string,
  frontendVerdict: ComicUploadVerdict,
  modComment?: string
) {
  let publishStatus = 'pending';
  let verdict: ComicUploadVerdict = frontendVerdict.toString() as ComicUploadVerdict;
  if (frontendVerdict === 'rejected') publishStatus = 'rejected';
  if (frontendVerdict === 'rejected-list') {
    publishStatus = 'rejected-list';
    verdict = 'rejected';
  }

  let comicQuery = `UPDATE comic SET publishStatus = ? WHERE id = ?`;
  let comicQueryParams = [publishStatus, comicId];
  let detailsQuery =
    'UPDATE unpublishedcomic SET verdict = ?, modComment = ? WHERE comicId = ?';
  let detailsQueryParams = [verdict, modComment, comicId];

  if (frontendVerdict === 'rejected') {
    const randomStr = randomString(6);
    const newComicName = `${comicName}-REJECTED-${randomStr}`;
    comicQuery = `UPDATE comic SET publishStatus = ?, name = ? WHERE id = ?`;
    comicQueryParams = [publishStatus, newComicName, comicId];
    detailsQuery =
      'UPDATE unpublishedcomic SET verdict = ?, modComment = ?, originalNameIfRejected = ? WHERE comicId = ?';
    detailsQueryParams = [verdict, modComment, comicName, comicId];
  }

  await Promise.all([
    queryDbDirect(urlBase, comicQuery, comicQueryParams),
    queryDbDirect(urlBase, detailsQuery, detailsQueryParams),
  ]);

  return;
}
