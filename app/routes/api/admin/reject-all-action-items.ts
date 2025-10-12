import type { Route } from './+types/reject-all-action-items';
import type { DashboardActionType } from './dashboard-data';
import {
  queryDbExec,
  queryDbMultiple,
  type QueryWithParams,
} from '~/utils/database-facade';
import { redirectIfNotMod } from '~/utils/loaders';
import { createSuccessJson, makeDbErr, processApiError } from '~/utils/request-helpers';

export async function action(args: Route.ActionArgs) {
  const currentUser = await redirectIfNotMod(args);
  const formData = await args.request.formData();

  const itemsJson = formData.get('actionsToRejectJson') as string;
  const items = JSON.parse(itemsJson) as {
    type: DashboardActionType;
    id: number;
  }[];

  const formBanIP = formData.get('banIP');
  const banIP = formBanIP ? (formBanIP as string) : null;

  const queriesWithParams: QueryWithParams[] = [];

  for (const item of items) {
    switch (item.type) {
      case 'tagSuggestion':
        queriesWithParams.push({
          query: 'UPDATE tagsuggestiongroup SET isProcessed = 1, modId = ? WHERE id = ?',
          params: [currentUser.userId, item.id],
          queryName: 'Tag suggestion group rejection',
        });
        break;

      case 'comicCommentReport':
        queriesWithParams.push({
          query: 'UPDATE comiccommentreport SET isProcessed = 1, modId = ? WHERE id = ?',
          params: [currentUser.userId, item.id],
          queryName: 'Comic comment report rejection',
        });
        break;

      case 'comicProblem':
        queriesWithParams.push({
          query: "UPDATE comicproblem SET status = 'rejected', modId = ? WHERE id = ?",
          params: [currentUser.userId, item.id],
          queryName: 'Comic problem rejection',
        });
        break;

      case 'comicSuggestion':
        queriesWithParams.push({
          query: "UPDATE comicsuggestion SET status = 'rejected', modId = ? WHERE id = ?",
          params: [currentUser.userId, item.id],
          queryName: 'Comic suggestion rejection',
        });
        break;

      case 'comicUpload':
        queriesWithParams.push({
          query: 'DELETE FROM comic WHERE id = ?',
          params: [item.id],
          queryName: 'Comic upload rejection (delete)',
        });
        break;

      default:
        break;
    }
  }

  const dbRes = await queryDbMultiple(args.context.cloudflare.env.DB, queriesWithParams);

  if (dbRes.isError) {
    return processApiError(
      'Error in /admin/reject-all-action-items',
      makeDbErr(dbRes),
      items
    );
  }

  if (banIP) {
    const dbRes = await queryDbExec(
      args.context.cloudflare.env.DB,
      'INSERT OR IGNORE INTO ipban (ip) VALUES (?)',
      [banIP],
      'Ban IP'
    );

    if (dbRes.isError) {
      return processApiError(
        'Error banning IP in /admin/reject-all-action-items',
        makeDbErr(dbRes),
        items
      );
    }
  }

  return createSuccessJson();
}
