import type { AllowedAnonComicVerdict } from '~/routes/admin.comics.$comic/AnonUploadedComicSection';
import type { ComicPublishStatus, ComicUploadVerdict } from '~/types/types';
import { redirectIfNotMod } from '~/utils/loaders';
import {
  create400Json,
  createSuccessJson,
  noGetRoute,
  processApiError,
} from '~/utils/request-helpers';
import { processAnyUpload } from './api.admin.process-user-upload';
import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { addModLogAndPoints } from '~/route-funcs/add-mod-log-and-points';

export { noGetRoute as loader };

export async function action(args: ActionFunctionArgs) {
  const user = await redirectIfNotMod(args);
  const formDataBody = await args.request.formData();

  const formComicId = formDataBody.get('comicId');
  if (!formComicId) return create400Json('Missing comicId');
  const comicId = parseInt(formComicId.toString());

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

  const err = await processAnyUpload({
    modId: user.userId,
    db: args.context.cloudflare.env.DB,
    comicId,
    comicName: comicName.toString(),
    modComment: undefined,
    publishStatus,
    frontendVerdict: comicUploadVerdict,
    metadataVerdict: undefined,
    imagesServerUrl: args.context.cloudflare.env.IMAGES_SERVER_URL,
  });

  if (err) {
    return processApiError('Error in /process-anon-upload', err, {
      comicId,
      verdict,
    });
  }

  const logText = `Verdict: ${verdict}`;
  const modLogErr = await addModLogAndPoints({
    db: args.context.cloudflare.env.DB,
    userId: user.userId,
    comicId,
    actionType: 'upload-processed',
    text: logText,
  });
  if (modLogErr) {
    return processApiError('Error in /process-anon-upload', modLogErr);
  }

  return createSuccessJson();
}
