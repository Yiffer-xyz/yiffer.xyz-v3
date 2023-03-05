import { ActionArgs } from '@remix-run/cloudflare';
import { authLoader } from '~/utils/loaders';

export type ProcessTagSuggestionBody = {
  isApproved: boolean;
  actionId: number;
  isAdding: boolean;
  comicId: number;
  tagId: number;
};

// The remix route handler
export async function action(args: ActionArgs) {
  const urlBase = args.context.DB_API_URL_BASE as string;
  const user = await authLoader(args);
  if (!user.user) return new Response('Unauthorized', { status: 401 });

  const formDataBody = await args.request.formData();
  const body = formDataBody.get('body') as string;
  const fields = JSON.parse(body) as ProcessTagSuggestionBody;

  // TODO: Let this stand for now. Just to simluate loading etc in front-end.
  // wait 2 seconds
  await new Promise(resolve => setTimeout(resolve, 2000));
  return new Response('OK', { status: 200 });

  await processTagSuggestion(
    urlBase,
    user.user?.userId as number,
    fields.isApproved,
    fields.actionId,
    fields.isAdding,
    fields.comicId,
    fields.tagId
  );

  return new Response('OK', { status: 200 });
}

// The actual logic
async function processTagSuggestion(
  urlBase: string,
  modId: number,
  isApproved: boolean,
  actionId: number,
  isAdding: boolean,
  comicId: number,
  tagId: number
) {
  const updateActionQuery = `UPDATE keywordsuggestion SET status = ?, modId = ? WHERE id = ?`;
  const updateActionQueryParams = [isApproved ? 'approved' : 'rejected', modId, actionId];

  let updateTagQuery = undefined;
  let updateTagQueryParams = undefined;

  if (isApproved) {
    if (isAdding) {
      updateTagQuery = `INSERT INTO comickeyword (comicId, keywordId) VALUES (?, ?)`;
      updateTagQueryParams = [comicId, tagId];
    } else {
      updateTagQuery = `DELETE FROM comickeyword WHERE comicId = ? AND keywordId = ?`;
      updateTagQueryParams = [comicId, tagId];
    }

    await queryDbDirect(urlBase, updateTagQuery, updateTagQueryParams);
  }

  await queryDbDirect(urlBase, updateActionQuery, updateActionQueryParams);

  return;
}
