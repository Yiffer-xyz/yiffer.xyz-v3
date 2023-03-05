import { ComicSuggestionVerdict } from '~/types/contributions';
import { queryDbDirect } from '~/utils/database-facade';
import { DashboardAction } from '.';

// TODO: Move this to its handler when that is created, like the lower func in process-tag-suggestion.ts
// Relevant for everything except for tag suggestions, which are just instantly approved/rejected
export async function assignActionToMod(
  urlBase: string,
  action: DashboardAction,
  modId: number
) {
  const tableToUpdate = action.type.toLowerCase();
  const query = `UPDATE ${tableToUpdate} SET modId = ? WHERE id = ?`;
  const queryParams = [modId, action.id];

  await queryDbDirect(urlBase, query, queryParams);
  return;
}

// TODO: Move this to its handler when that is created, like the lower func in process-tag-suggestion.ts
export async function unassignActionFromMod(urlBase: string, action: DashboardAction) {
  const tableToUpdate = action.type.toLowerCase();
  const query = `UPDATE ${tableToUpdate} SET modId = NULL WHERE id = ?`;
  const queryParams = [action.id];

  await queryDbDirect(urlBase, query, queryParams);
  return;
}

// TODO: Move this to its handler when that is created, like the lower func in process-tag-suggestion.ts
export async function processComicProblem(
  urlBase: string,
  isApproved: boolean,
  action: DashboardAction
) {
  const updateActionQuery = `UPDATE comicproblem SET status = ?, WHERE id = ?`;
  const updateActionQueryParams = [isApproved ? 'approved' : 'rejected', action.id];

  await queryDbDirect(urlBase, updateActionQuery, updateActionQueryParams);

  return;
}

// TODO: Move this to its handler when that is created, like the lower func in process-tag-suggestion.ts
export async function processComicSuggestion(
  urlBase: string,
  isApproved: boolean,
  action: DashboardAction,
  verdict: ComicSuggestionVerdict, // always if approved, otherwise none
  modComment?: string // only potentially if rejected
) {
  const updateQuery = `UPDATE comicsuggestion
    SET status = ?,
    ${verdict ? 'verdict = ?' : ''}
    ${modComment ? ', modComment = ?' : ''}
    WHERE id = ?`;

  const updateQueryParams = [
    isApproved ? 'approved' : 'rejected',
    ...(verdict ? [verdict] : []),
    ...(modComment ? [modComment] : []),
    action.id,
  ];

  await queryDbDirect(urlBase, updateQuery, updateQueryParams);

  return;
}
