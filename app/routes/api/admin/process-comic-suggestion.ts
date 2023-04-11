import { ActionArgs } from '@remix-run/cloudflare';
import { ComicSuggestionVerdict } from '~/types/types';
import { queryDb } from '~/utils/database-facade';
import { parseFormJson } from '~/utils/formdata-parser';
import {
  ApiError,
  createSuccessJson,
  makeDbErr,
  processApiError,
} from '~/utils/request-helpers';
import { addContributionPoints } from '../funcs/add-contribution-points';

export type ProcessComicSuggestionBody = {
  actionId: number;
  isApproved: boolean;
  verdict?: ComicSuggestionVerdict;
  modComment?: string;
  suggestingUserId?: number;
};

export async function action(args: ActionArgs) {
  const { fields, user, isUnauthorized } =
    await parseFormJson<ProcessComicSuggestionBody>(args, 'mod');
  if (isUnauthorized) return new Response('Unauthorized', { status: 401 });
  const urlBase = args.context.DB_API_URL_BASE as string;

  const err = await processComicSuggestion(
    urlBase,
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
  return createSuccessJson();
}

async function processComicSuggestion(
  urlBase: string,
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

  const dbRes = await queryDb(urlBase, updateQuery, updateQueryParams);
  if (dbRes.errorMessage) {
    return makeDbErr(dbRes, 'Error updating comic suggestion');
  }

  const tableName = isApproved ? `comicSuggestion${verdict}` : 'comicSuggestionRejected';
  const err = await addContributionPoints(urlBase, suggestingUserId ?? null, tableName);
  if (err) return err;
}
