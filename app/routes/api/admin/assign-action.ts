import { ActionArgs } from '@remix-run/cloudflare';
import { queryDbDirect } from '~/utils/database-facade';
import { parseFormJson } from '~/utils/formdata-parser';

export type AssignActionBody = {
  actionId: number;
  actionType: string;
  modId: number;
};

export async function action(args: ActionArgs) {
  const { fields, isUnauthorized } = await parseFormJson<AssignActionBody>(args, 'mod');
  if (isUnauthorized) return new Response('Unauthorized', { status: 401 });
  const urlBase = args.context.DB_API_URL_BASE as string;

  await assignActionToMod(urlBase, fields.actionId, fields.actionType, fields.modId);

  return new Response('OK', { status: 200 });
}

async function assignActionToMod(
  urlBase: string,
  actionId: number,
  actionType: string,
  modId: number
) {
  const tableToUpdate = actionType.toLowerCase();
  const query = `UPDATE ${tableToUpdate} SET modId = ? WHERE id = ?`;
  const queryParams = [modId, actionId];

  await queryDbDirect(urlBase, query, queryParams);
  return;
}
