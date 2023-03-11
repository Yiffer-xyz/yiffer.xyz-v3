import { ActionArgs } from '@remix-run/cloudflare';
import { AllowedAnonComicVerdict } from '~/routes/admin/comics/AnonUploadedComicSection';
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

  const formComicName = formDataBody.get('comicName');
  if (!formComicName) return create400Json('Missing comicName');

  const formVerdict = formDataBody.get('verdict');
  if (!formVerdict) return create400Json('Missing verdict');
  const verdict = formVerdict.toString() as AllowedAnonComicVerdict;

  try {
    await processAnonUpload(
      urlBase,
      parseInt(formComicId.toString()),
      formComicName.toString(),
      verdict
    );
  } catch (e) {
    return e instanceof Error ? create500Json(e.message) : createGeneric500Json();
  }

  return createSuccessJson();
}

export async function processAnonUpload(
  urlBase: string,
  comicId: number,
  comicName: string,
  verdict: AllowedAnonComicVerdict
) {
  let query: string;
  let queryParams: any[];

  if (verdict === 'approved' || verdict === 'rejected-list') {
    const newStatus = verdict === 'approved' ? 'pending' : 'rejected-list';
    query = 'UPDATE comic SET publishStatus = ? WHERE id = ?';
    queryParams = [newStatus, comicId];
  } else {
    const randomStr = randomString(6);
    const newComicName = `${comicName}-REJECTED-${randomStr}`;
    query = `UPDATE comic SET publishStatus = 'rejected', name = ? WHERE id = ?`;
    queryParams = [newComicName, comicId];
  }

  await queryDbDirect(urlBase, query, queryParams);

  return;
}
