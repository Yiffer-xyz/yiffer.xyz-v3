import type { ComicSuggestionVerdict } from '~/types/types';
import { queryDbExec } from '~/utils/database-facade';
import { parseFormJson } from '~/utils/formdata-parser';
import type { ApiError, noGetRoute } from '~/utils/request-helpers';
import { createSuccessJson, makeDbErr, processApiError } from '~/utils/request-helpers';
import { addContributionPoints } from '~/route-funcs/add-contribution-points';
import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { addModLogAndPoints } from '~/route-funcs/add-mod-log-and-points';

export { noGetRoute as loader };

export type ProcessComicSuggestionBody = {
  actionId: number;
  isApproved: boolean;
  comicName: string;
  verdict?: ComicSuggestionVerdict;
  modComment?: string;
  suggestingUserId?: number;
};

export async function action(args: ActionFunctionArgs) {
  const { fields, user, isUnauthorized } =
    await parseFormJson<ProcessComicSuggestionBody>(args, 'mod');
  if (isUnauthorized || !user) return new Response('Unauthorized', { status: 401 });

  const err = await processComicSuggestion(
    args.context.cloudflare.env.DB,
    fields.actionId,
    fields.isApproved,
    user!.userId,
    fields.verdict,
    fields.modComment,
    fields.suggestingUserId
  );

  if (err) {
    return processApiError('Error in /process-comic-suggestion', err, {
      ...fields,
    });
  }

  let verdictText = fields.isApproved ? 'Approved' : 'Rejected';
  if (fields.verdict) verdictText += ` - ${fields.verdict}`;
  let logText = `Comic: ${fields.comicName} \n${verdictText}`;
  if (fields.modComment) logText += ` \nMod comment: ${fields.modComment}`;
  const modLogErr = await addModLogAndPoints({
    db: args.context.cloudflare.env.DB,
    userId: user.userId,
    dashboardActionId: fields.actionId,
    actionType: 'suggestion-processed',
    text: logText,
  });
  if (modLogErr) {
    return processApiError('Error in /process-comic-suggestion', modLogErr);
  }

  return createSuccessJson();
}

async function processComicSuggestion(
  db: D1Database,
  actionId: number,
  isApproved: boolean,
  modId: number,
  verdict?: ComicSuggestionVerdict, // always if approved, otherwise none
  modComment?: string, // only potentially if rejected
  suggestingUserId?: number // only if non-anon suggestion
): Promise<ApiError | undefined> {
  const updateQuery = `UPDATE comicsuggestion
    SET status = ?, modId = ?
    ${verdict ? ', verdict = ?' : ''}
    ${modComment ? ', modComment = ?' : ''}
    WHERE id = ?`;

  const updateQueryParams = [
    isApproved ? 'approved' : 'rejected',
    modId,
    ...(verdict ? [verdict] : []),
    ...(modComment ? [modComment] : []),
    actionId,
  ];

  const dbRes = await queryDbExec(
    db,
    updateQuery,
    updateQueryParams,
    'Comic suggestion processing'
  );
  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error updating comic suggestion');
  }

  const columnName = isApproved ? `comicSuggestion${verdict}` : 'comicSuggestionRejected';
  const err = await addContributionPoints(db, suggestingUserId ?? null, columnName);
  if (err) return err;
}
