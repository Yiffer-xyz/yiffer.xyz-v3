import { ActionArgs } from '@remix-run/cloudflare';
import { AllowedAnonComicVerdict } from '~/routes/admin/comics/AnonUploadedComicSection';
import { ComicPublishStatus, ComicUploadVerdict } from '~/types/types';
import { redirectIfNotMod } from '~/utils/loaders';
import {
  create400Json,
  create500Json,
  createSuccessJson,
  logErrorOLD_DONOTUSE,
} from '~/utils/request-helpers';
import { processAnyUpload } from './process-user-upload';

export async function action(args: ActionArgs) {
  const user = await redirectIfNotMod(args);
  const urlBase = args.context.DB_API_URL_BASE as string;

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
    logErrorOLD_DONOTUSE(
      `Error in /process-anon-upload for comic name/id ${comicName.toString()} / ${formComicId.toString()}, verdict: ${verdict}`,
      err
    );
    return create500Json(err.client400Message);
  }

  return createSuccessJson();
}
