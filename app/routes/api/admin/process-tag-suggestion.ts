import { ActionArgs } from '@remix-run/cloudflare';
import { queryDbDirect } from '~/utils/database-facade';
import { parseFormJson } from '~/utils/formdata-parser';

export type ProcessTagSuggestionBody = {
  isApproved: boolean;
  actionId: number;
  isAdding: boolean;
  comicId: number;
  tagId: number;
};

// The remix route handler
export async function action(args: ActionArgs) {
  const { fields, isUnauthorized, user } = await parseFormJson<ProcessTagSuggestionBody>(
    args,
    'mod'
  );
  if (isUnauthorized) return new Response('Unauthorized', { status: 401 });
  const urlBase = args.context.DB_API_URL_BASE as string;

  // TODO: Let this stand for now. Just to simluate loading etc in front-end
  // without "ruining" the nice testdata in the db.
  await new Promise(resolve => setTimeout(resolve, 2000));
  return new Response('OK', { status: 200 });

  await processTagSuggestion(
    urlBase,
    user?.userId as number,
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
