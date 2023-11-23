import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import type { AllowedAnonComicVerdict } from '~/routes/admin.comics.$comic/AnonUploadedComicSection';
import type { ComicPublishStatus, ComicUploadVerdict } from '~/types/types';
import { redirectIfNotMod } from '~/utils/loaders';
import {
  create400Json,
  createSuccessJson,
  processApiError,
} from '~/utils/request-helpers';
import { processAnyUpload } from './api.admin.process-user-upload';

export async function action(args: ActionFunctionArgs) {
  const user = await redirectIfNotMod(args);
  const urlBase = args.context.DB_API_URL_BASE;

  const formDataBody = await args.request.formData();

  const formComicId = formDataBody.get('comicId');
  if (!formComicId) return create400Json('Missing comicId');

  const comicName = formDataBody.get('comicName');
  if (!comicName) return create400Json('Missing comicName');

  const formVerdict = formDataBody.get('verdict');
  if (!formVerdict) return create400Json('Missing verdict');
  const verdict = formVerdict.toString() as AllowedAnonComicVerdict;

  let publishStatus: ComicPublishStatus = 'pending';
  let comicUploadVerdict: ComicUploadVerdict = 'excellent';

  if (verdict === 'rejected') {
    publishStatus = 'rejected';
    comicUploadVerdict = 'rejected';
  }
  if (verdict === 'rejected-list') {
    publishStatus = 'rejected-list';
    comicUploadVerdict = 'rejected-list';
  }

  const err = await processAnyUpload(
    user.userId,
    urlBase,
    parseInt(formComicId.toString()),
    comicName.toString(),
    undefined,
    publishStatus,
    comicUploadVerdict,
    undefined
  );

  if (err) {
    processApiError('Error in /process-anon-upload', err, {
      comicId: formComicId.toString(),
      verdict,
    });
  }

  return createSuccessJson();
}
