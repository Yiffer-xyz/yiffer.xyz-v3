import { ActionArgs } from '@remix-run/cloudflare';
import { queryDb } from '~/utils/database-facade';
import { parseFormJson } from '~/utils/formdata-parser';
import {
  ApiError,
  createSuccessJson,
  makeDbErr,
  processApiError,
} from '~/utils/request-helpers';
import { DashboardActionType } from './dashboard-data';

export type UnAssignActionBody = {
  actionId: number;
  actionType: DashboardActionType;
};

export async function action(args: ActionArgs) {
  const { fields, isUnauthorized } = await parseFormJson<UnAssignActionBody>(args, 'mod');
  if (isUnauthorized) return new Response('Unauthorized', { status: 401 });
  const urlBase = args.context.DB_API_URL_BASE as string;

  const err = await unAssignActionToMod(urlBase, fields.actionId, fields.actionType);
  if (err) {
    return processApiError('Error in /unassign-action', err);
  }
  return createSuccessJson();
}

async function unAssignActionToMod(
  urlBase: string,
  actionId: number,
  actionType: DashboardActionType
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
  if (actionType === 'pendingComicProblem') {
    table = 'comicmetadata';
    identifyingColumn = 'comicId';
    modIdColumn = 'pendingProblemModId';
  }

  const query = `UPDATE ${table} SET ${modIdColumn} = NULL WHERE ${identifyingColumn} = ?`;
  const queryParams = [actionId];

  const dbRes = await queryDb(urlBase, query, queryParams);
  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error unassigning mod action', {
      actionId,
      actionType,
    });
  }
}
