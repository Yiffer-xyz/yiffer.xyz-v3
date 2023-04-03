import { ActionArgs } from '@remix-run/cloudflare';
import { queryDbDirect } from '~/utils/database-facade';
import { parseFormJson } from '~/utils/formdata-parser';
import { DashboardActionType } from './dashboard-data';

export type UnAssignActionBody = {
  actionId: number;
  actionType: DashboardActionType;
};

export async function action(args: ActionArgs) {
  const { fields, isUnauthorized } = await parseFormJson<UnAssignActionBody>(args, 'mod');
  if (isUnauthorized) return new Response('Unauthorized', { status: 401 });
  const urlBase = args.context.DB_API_URL_BASE as string;

  await assignActionToMod(urlBase, fields.actionId, fields.actionType);

  return new Response('OK', { status: 200 });
}

async function assignActionToMod(
  urlBase: string,
  actionId: number,
  actionType: DashboardActionType
) {
  let table = '';
  let identifyingColumn = '';

  if (actionType === 'comicUpload') {
    table = 'comicmetadata';
    identifyingColumn = 'comicId';
  }
  if (actionType === 'comicSuggestion') {
    table = 'comicsuggestion';
    identifyingColumn = 'id';
  }

  const query = `UPDATE ${table} SET modId = NULL WHERE ${identifyingColumn} = ?`;
  const queryParams = [actionId];

  await queryDbDirect(urlBase, query, queryParams);
  return;
}
