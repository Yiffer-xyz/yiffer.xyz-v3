import { queryDb, queryDbExec } from '~/utils/database-facade';
import { parseFormJson } from '~/utils/formdata-parser';
import type { noGetRoute, ResultOrErrorPromise } from '~/utils/request-helpers';
import {
  create400Json,
  createSuccessJson,
  makeDbErrObj,
  processApiError,
} from '~/utils/request-helpers';
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

  const res = await assignActionToMod(
    args.context.cloudflare.env.DB,
    fields.actionId,
    fields.actionType,
    fields.modId
  );
  if (res.err) return processApiError('Error in /assign-action', res.err);
  if (res.result.isAlreadyTaken) {
    return create400Json('Action already assigned to a mod');
  }
  return createSuccessJson();
}

async function assignActionToMod(
  db: D1Database,
  actionId: number,
  actionType: DashboardActionType,
  modId: number
): ResultOrErrorPromise<{ isAlreadyTaken: boolean }> {
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

  const getExistingModId = `SELECT ${modIdColumn} FROM ${table} WHERE ${identifyingColumn} = ?`;
  const existingModIdRes = await queryDb<{ modId: number }[]>(db, getExistingModId, [
    actionId,
  ]);
  if (existingModIdRes.isError) {
    return makeDbErrObj(existingModIdRes, 'Error getting existing mod id', {
      actionId,
      actionType,
    });
  }

  if (
    existingModIdRes.result.length > 0 &&
    existingModIdRes.result[0][modIdColumn] !== null
  ) {
    return { result: { isAlreadyTaken: true } };
  }

  const query = `UPDATE ${table} SET ${modIdColumn} = ? WHERE ${identifyingColumn} = ?`;
  const queryParams = [modId, actionId];

  const dbRes = await queryDbExec(db, query, queryParams, 'Assign action to mod');
  if (dbRes.isError) {
    return makeDbErrObj(dbRes, 'Error assigning action to mod', {
      actionId,
      actionType,
      modId,
    });
  }

  return { result: { isAlreadyTaken: false } };
}
