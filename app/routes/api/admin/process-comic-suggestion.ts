import { ActionArgs } from '@remix-run/cloudflare';
import { ComicSuggestionVerdict } from '~/types/types';
import { queryDbDirect } from '~/utils/database-facade';
import { parseFormJson } from '~/utils/formdata-parser';
import { createSuccessJson } from '~/utils/request-helpers';

export type ProcessComicSuggestionBody = {
  actionId: number;
  isApproved: boolean;
  verdict?: ComicSuggestionVerdict;
  modComment?: string;
};

export async function action(args: ActionArgs) {
  const { fields, user, isUnauthorized } =
    await parseFormJson<ProcessComicSuggestionBody>(args, 'mod');
  if (isUnauthorized) return new Response('Unauthorized', { status: 401 });
  const urlBase = args.context.DB_API_URL_BASE as string;

  await processComicSuggestion(
    urlBase,
    fields.actionId,
    fields.isApproved,
    user!.userId,
    fields.verdict,
    fields.modComment
  );

  return createSuccessJson();
}

async function processComicSuggestion(
  urlBase: string,
  actionId: number,
  isApproved: boolean,
  modId: number,
  verdict?: ComicSuggestionVerdict, // always if approved, otherwise none
  modComment?: string // only potentially if rejected
) {
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

  await queryDbDirect(urlBase, updateQuery, updateQueryParams);
}
