import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { queryDb } from '~/utils/database-facade';
import { parseFormJson } from '~/utils/formdata-parser';
import type { ApiError } from '~/utils/request-helpers';
import {
  createSuccessJson,
  makeDbErr,
  processApiError,
  wrapApiError,
} from '~/utils/request-helpers';
import { addContributionPoints } from '~/route-funcs/add-contribution-points';

export type ProcessTagSuggestionBody = {
  isApproved: boolean;
  actionId: number;
  isAdding: boolean;
  comicId: number;
  tagId: number;
  suggestingUserId?: number;
};

export async function action(args: ActionFunctionArgs) {
  const { fields, isUnauthorized, user } = await parseFormJson<ProcessTagSuggestionBody>(
    args,
    'mod'
  );
  if (isUnauthorized) return new Response('Unauthorized', { status: 401 });
  const err = await processTagSuggestion(
    args.context.DB,
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
  db: D1Database,
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

  if (isApproved) {
    let updateTagQuery = undefined;
    let updateTagQueryParams = undefined;

    if (isAdding) {
      updateTagQuery = `INSERT INTO comickeyword (comicId, keywordId) VALUES (?, ?)`;
      updateTagQueryParams = [comicId, tagId];
    } else {
      updateTagQuery = `DELETE FROM comickeyword WHERE comicId = ? AND keywordId = ?`;
      updateTagQueryParams = [comicId, tagId];
    }

    const dbRes = await queryDb(db, updateTagQuery, updateTagQueryParams);
    if (dbRes.isError) {
      if (dbRes.errorMessage.includes('UNIQUE constraint failed')) {
        // If tag already existed on comic, just return silently. It's ok.
      } else {
        return makeDbErr(dbRes, 'Error updating comickeyword in processTagSuggestion');
      }
    }
  }

  const dbRes = await queryDb(db, updateActionQuery, updateActionQueryParams);
  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error updating keywordsuggestion in processTagSuggestion');
  }

  const tableName = isApproved ? 'tagSuggestion' : 'tagSuggestionRejected';
  const err = await addContributionPoints(db, suggestingUserId ?? null, tableName);
  if (err) {
    return wrapApiError(err, `Error adding contribution points`);
  }
}
