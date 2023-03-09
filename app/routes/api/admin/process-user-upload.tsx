import { ActionArgs, json } from '@remix-run/cloudflare';
import { ComicUploadVerdict } from '~/types/types';
import { queryDb, queryDbDirect } from '~/utils/database-facade';
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

  const verdict: ComicUploadVerdict = formVerdict.toString() as ComicUploadVerdict;
  const formModComment = formDataBody.get('modComment');
  const modComment = formModComment ? formModComment.toString() : undefined;

  try {
    await processUserUpload(
      urlBase,
      parseInt(formComicId.toString()),
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
  verdict: ComicUploadVerdict,
  modComment?: string
) {
  const isApproved = verdict !== 'rejected';

  const comicQuery = 'UPDATE comic SET publishStatus = ? WHERE id = ?';
  const comicQueryParams = [isApproved ? 'pending' : 'rejected', comicId];

  const detailsQuery =
    'UPDATE unpublishedcomic SET verdict = ?, modComment = ? WHERE comicId = ?';
  const detailsQueryParams = [verdict, modComment, comicId];

  await Promise.all([
    queryDbDirect(urlBase, comicQuery, comicQueryParams),
    queryDbDirect(urlBase, detailsQuery, detailsQueryParams),
  ]);

  return;
}
