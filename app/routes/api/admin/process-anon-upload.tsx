import { ActionArgs, json } from '@remix-run/cloudflare';
import { queryDbDirect } from '~/utils/database-facade';
import { redirectIfNotMod } from '~/utils/loaders';

export async function action(args: ActionArgs) {
  await redirectIfNotMod(args);
  const urlBase = args.context.DB_API_URL_BASE as string;

  const formDataBody = await args.request.formData();

  const formComicId = formDataBody.get('comicId');
  if (!formComicId) return new Response('Missing comicId', { status: 400 });
  const formIsApproved = formDataBody.get('isApproved');
  if (!formIsApproved) return new Response('Missing isApproved', { status: 400 });
  const isApproved = formIsApproved ? formIsApproved.toString() === 'true' : false;

  await processAnonUpload(urlBase, parseInt(formComicId.toString()), isApproved);

  return json({ success: true });
}

export async function processAnonUpload(
  urlBase: string,
  comicId: number,
  isApproved: boolean
) {
  const query = 'UPDATE comic SET publishStatus = ? WHERE id = ?';
  const queryParams = [isApproved ? 'pending' : 'rejected', comicId];

  await queryDbDirect(urlBase, query, queryParams);

  return;
}
