import { queryDbExec } from '~/utils/database-facade';
import { parseFormJson } from '~/utils/formdata-parser';
import type { ApiError, noGetRoute } from '~/utils/request-helpers';
import { createSuccessJson, makeDbErr, processApiError } from '~/utils/request-helpers';
import type { DashboardActionType } from './api.admin.dashboard-data';
import type { ActionFunctionArgs } from '@remix-run/cloudflare';

export { noGetRoute as loader };

export type AssignActionBody = {
  actionId: number;
  actionType: DashboardActionType;
  modId: number;
};

export async function action(args: ActionFunctionArgs) {
  const { fields, isUnauthorized } = await parseFormJson<AssignActionBody>(args, 'mod');
  if (isUnauthorized) return new Response('Unauthorized', { status: 401 });

  const err = await assignActionToMod(
    args.context.cloudflare.env.DB,
    fields.actionId,
    fields.actionType,
    fields.modId
  );
  if (err) return processApiError('Error in /assign-action', err);
  return createSuccessJson();
}

async function assignActionToMod(
  db: D1Database,
  actionId: number,
  actionType: DashboardActionType,
  modId: number
): Promise<ApiError | undefined> {
  let table = '';
  let identifyingColumn = 'id';
  let modIdColumn = 'modId';

  if (actionType === 'comicUpload') {
    table = 'comicmetadata';
    identifyingColumn = 'comicId';
  }
  if (actionType === 'comicSuggestion') {
    table = 'comicsuggestion';
  }
  if (actionType === 'comicProblem') {
    table = 'comicproblem';
  }
  if (actionType === 'tagSuggestion') {
    table = 'tagsuggestiongroup';
  }
  if (actionType === 'pendingComicProblem') {
    table = 'comicmetadata';
    identifyingColumn = 'comicId';
    modIdColumn = 'pendingProblemModId';
  }

  const query = `UPDATE ${table} SET ${modIdColumn} = ? WHERE ${identifyingColumn} = ?`;
  const queryParams = [modId, actionId];

  const dbRes = await queryDbExec(db, query, queryParams);
  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error assigning action to mod', {
      actionId,
      actionType,
      modId,
    });
  }
}
