import { queryDbExec } from '~/utils/database-facade';
import { parseFormJson } from '~/utils/formdata-parser';
import type { ApiError, noGetRoute } from '~/utils/request-helpers';
import { createSuccessJson, makeDbErr, processApiError } from '~/utils/request-helpers';
import type { DashboardActionType } from './api.admin.dashboard-data';
import { unstable_defineAction } from '@remix-run/cloudflare';

export { noGetRoute as loader };

export type UnAssignActionBody = {
  actionId: number;
  actionType: DashboardActionType;
};

export const action = unstable_defineAction(async args => {
  const { fields, isUnauthorized } = await parseFormJson<UnAssignActionBody>(args, 'mod');
  if (isUnauthorized) return new Response('Unauthorized', { status: 401 });

  const err = await unAssignActionToMod(
    args.context.cloudflare.env.DB,
    fields.actionId,
    fields.actionType
  );
  if (err) {
    return processApiError('Error in /unassign-action', err);
  }
  return createSuccessJson();
});

async function unAssignActionToMod(
  db: D1Database,
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
  if (actionType === 'tagSuggestion') {
    table = 'tagsuggestiongroup';
  }
  if (actionType === 'pendingComicProblem') {
    table = 'comicmetadata';
    identifyingColumn = 'comicId';
    modIdColumn = 'pendingProblemModId';
  }

  const query = `UPDATE ${table} SET ${modIdColumn} = NULL WHERE ${identifyingColumn} = ?`;
  const queryParams = [actionId];

  const dbRes = await queryDbExec(db, query, queryParams);
  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error unassigning mod action', {
      actionId,
      actionType,
    });
  }
}
