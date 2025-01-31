import { queryDbExec } from '~/utils/database-facade';
import { parseFormJson } from '~/utils/formdata-parser';
import type { ApiError, noGetRoute } from '~/utils/request-helpers';
import { createSuccessJson, makeDbErr, processApiError } from '~/utils/request-helpers';
import { addContributionPoints } from '~/route-funcs/add-contribution-points';
import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { addModLogAndPoints } from '~/route-funcs/add-mod-log-and-points';

export { noGetRoute as loader };

export type ProcessComicProblemBody = {
  actionId: number;
  isApproved: boolean;
  reportingUserId?: number;
  comicId: number;
};

export async function action(args: ActionFunctionArgs) {
  const { fields, isUnauthorized, user } = await parseFormJson<ProcessComicProblemBody>(
    args,
    'mod'
  );
  if (isUnauthorized || !user) return new Response('Unauthorized', { status: 401 });

  const err = await processComicProblem(
    args.context.cloudflare.env.DB,
    fields.isApproved,
    fields.actionId,
    user!.userId,
    fields.reportingUserId
  );

  if (err)
    return processApiError('Error in /process-comic-problem', err, {
      ...fields,
    });

  const modLogErr = await addModLogAndPoints({
    db: args.context.cloudflare.env.DB,
    userId: user.userId,
    comicId: fields.comicId,
    dashboardActionId: fields.actionId,
    actionType: 'problem-processed',
    text: `${fields.isApproved ? 'Approved' : 'Rejected'}`,
  });
  if (modLogErr) {
    return processApiError('Error in /process-comic-problem', modLogErr);
  }

  return createSuccessJson();
}

async function processComicProblem(
  db: D1Database,
  isApproved: boolean,
  actionId: number,
  modId: number,
  reportingUserId?: number
): Promise<ApiError | undefined> {
  const updateActionQuery = `UPDATE comicproblem SET status = ?, modId = ? WHERE id = ?`;
  const updateActionQueryParams = [isApproved ? 'approved' : 'rejected', modId, actionId];

  const dbRes = await queryDbExec(
    db,
    updateActionQuery,
    updateActionQueryParams,
    'Comic problem processing'
  );
  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error updating comic problem');
  }

  const err = await addContributionPoints(
    db,
    reportingUserId ?? null,
    isApproved ? 'comicProblem' : 'comicProblemRejected'
  );
  if (err) return err;
}
