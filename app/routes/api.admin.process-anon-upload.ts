import type { AllowedAnonComicVerdict } from '~/routes/admin.comics.$comic/AnonUploadedComicSection';
import type { ComicPublishStatus, ComicUploadVerdict } from '~/types/types';
import { redirectIfNotMod } from '~/utils/loaders';
import {
  create400Json,
  createSuccessJson,
  processApiError,
} from '~/utils/request-helpers';
import { processAnyUpload } from './api.admin.process-user-upload';
import { unstable_defineAction } from '@remix-run/cloudflare';

export const action = unstable_defineAction(async args => {
  const user = await redirectIfNotMod(args);
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
    args.context.cloudflare.env.DB,
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
});
