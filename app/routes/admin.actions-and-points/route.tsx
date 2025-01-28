import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { processApiError } from '~/utils/request-helpers';
import { getModActions } from '~/route-funcs/get-mod-actions';
import ModActionLog from './ModActionLog';
import ModScoreboard from './ModScoreboard';
import type { ModScore } from '~/route-funcs/get-mod-scoreboard';
import { getModScoreboard } from '~/route-funcs/get-mod-scoreboard';
import type { ModAction } from '~/types/types';
export { AdminErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction = () => {
  return [{ title: `Mod: Actions & Points | Yiffer.xyz` }];
};

export async function loader(args: LoaderFunctionArgs) {
  const url = new URL(args.request.url);
  const page = url.searchParams.get('page');
  const pageNum = page ? parseInt(page) : 1;

  const promises = [
    getModScoreboard(args.context.cloudflare.env.DB),
    getModActions(args.context.cloudflare.env.DB, pageNum),
  ];
  const [modScoreboardRes, modActionsRes] = await Promise.all(promises);

  if (modScoreboardRes.err) {
    return processApiError(
      'Error getting mod scoreboard in /admin/actions-and-points loader',
      modScoreboardRes.err
    );
  }
  if (modActionsRes.err) {
    return processApiError(
      'Error getting all mod actions in /admin/actions-and-points loader',
      modActionsRes.err
    );
  }

  return {
    modScoreboard: modScoreboardRes.result as ModScore[],
    modActions: modActionsRes.result as ModAction[],
    pageNum,
  };
}

export default function ModActionsAndPoints() {
  const { modActions, modScoreboard, pageNum } = useLoaderData<typeof loader>();

  return (
    <>
      <h1>Mod Actions & Points</h1>

      <ModScoreboard modScoreboard={modScoreboard} />

      <ModActionLog pageNum={pageNum} modActions={modActions} />
    </>
  );
}
