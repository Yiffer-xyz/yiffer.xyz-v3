import { ActionArgs } from '@remix-run/cloudflare';
import { queryDbDirect } from '~/utils/database-facade';
import { parseFormJson } from '~/utils/formdata-parser';

export type ProcessComicProblemBody = {
  actionId: number;
  isApproved: boolean;
};

export async function action(args: ActionArgs) {
  const { fields, isUnauthorized } = await parseFormJson<ProcessComicProblemBody>(
    args,
    'mod'
  );
  if (isUnauthorized) return new Response('Unauthorized', { status: 401 });
  const urlBase = args.context.DB_API_URL_BASE as string;

  // TODO: Let this stand for now. Just to simluate loading etc in front-end
  // without "ruining" the nice testdata in the db.
  await new Promise(resolve => setTimeout(resolve, 2000));
  return new Response('OK', { status: 200 });

  await processComicProblem(urlBase, fields.isApproved, fields.actionId);

  return new Response('OK', { status: 200 });
}

async function processComicProblem(
  urlBase: string,
  isApproved: boolean,
  actionId: number
) {
  const updateActionQuery = `UPDATE comicproblem SET status = ?, WHERE id = ?`;
  const updateActionQueryParams = [isApproved ? 'approved' : 'rejected', actionId];

  await queryDbDirect(urlBase, updateActionQuery, updateActionQueryParams);

  return;
}
