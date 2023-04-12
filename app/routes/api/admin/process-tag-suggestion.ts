import { ActionArgs } from '@remix-run/cloudflare';
import { queryDb } from '~/utils/database-facade';
import { parseFormJson } from '~/utils/formdata-parser';
import {
  ApiError,
  createSuccessJson,
  makeDbErr,
  processApiError,
  wrapApiError,
} from '~/utils/request-helpers';
import { addContributionPoints } from '../funcs/add-contribution-points';

export type ProcessTagSuggestionBody = {
  isApproved: boolean;
  actionId: number;
  isAdding: boolean;
  comicId: number;
  tagId: number;
  suggestingUserId?: number;
};

export async function action(args: ActionArgs) {
  const { fields, isUnauthorized, user } = await parseFormJson<ProcessTagSuggestionBody>(
    args,
    'mod'
  );
  if (isUnauthorized) return new Response('Unauthorized', { status: 401 });
  const urlBase = args.context.DB_API_URL_BASE as string;

  const err = await processTagSuggestion(
    urlBase,
    user?.userId as number,
    fields.isApproved,
    fields.actionId,
    fields.isAdding,
    fields.comicId,
    fields.tagId,
    fields.suggestingUserId
  );

  if (err) {
    return processApiError('Error in /process-tag-suggestion', err, {
      ...fields,
    });
  }
  return createSuccessJson();
}

async function processTagSuggestion(
  urlBase: string,
  modId: number,
  isApproved: boolean,
  actionId: number,
  isAdding: boolean,
  comicId: number,
  tagId: number,
  suggestingUserId?: number
): Promise<ApiError | undefined> {
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

    const dbRes = await queryDb(urlBase, updateTagQuery, updateTagQueryParams);
    if (dbRes.errorMessage) {
      if (!dbRes.errorCode || dbRes.errorCode !== 'ER_DUP_ENTRY') {
        return makeDbErr(dbRes, 'Error updating comickeyword');
      }
    }
  }

  const actionRes = await queryDb(urlBase, updateActionQuery, updateActionQueryParams);
  if (actionRes.errorMessage) {
    return makeDbErr(actionRes, 'Error updating mod panel action');
  }

  const tableName = isApproved ? 'tagSuggestion' : 'tagSuggestionRejected';
  const err = await addContributionPoints(urlBase, suggestingUserId ?? null, tableName);
  if (err) {
    return wrapApiError(err, `Error adding contribution points`);
  }
}
