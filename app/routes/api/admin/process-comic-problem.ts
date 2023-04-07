import { ActionArgs } from '@remix-run/cloudflare';
import { queryDbDirect } from '~/utils/database-facade';
import { parseFormJson } from '~/utils/formdata-parser';
import { createSuccessJson } from '~/utils/request-helpers';
import { addContributionPoints } from '../funcs/add-contribution-points';

export type ProcessComicProblemBody = {
  actionId: number;
  isApproved: boolean;
  reportingUserId?: number;
};

export async function action(args: ActionArgs) {
  const { fields, isUnauthorized, user } = await parseFormJson<ProcessComicProblemBody>(
    args,
    'mod'
  );
  if (isUnauthorized) return new Response('Unauthorized', { status: 401 });
  const urlBase = args.context.DB_API_URL_BASE as string;

  await processComicProblem(
    urlBase,
    fields.isApproved,
    fields.actionId,
    user!.userId,
    fields.reportingUserId
  );
  return createSuccessJson();
}

async function processComicProblem(
  urlBase: string,
  isApproved: boolean,
  actionId: number,
  modId: number,
  reportingUserId?: number
) {
  const updateActionQuery = `UPDATE comicproblem SET status = ?, modId = ? WHERE id = ?`;
  const updateActionQueryParams = [isApproved ? 'approved' : 'rejected', modId, actionId];

  await queryDbDirect(urlBase, updateActionQuery, updateActionQueryParams);

  await addContributionPoints(
    urlBase,
    reportingUserId ?? null,
    isApproved ? 'comicProblem' : 'comicProblemRejected'
  );
}
