import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { getComicTags } from '~/route-funcs/get-comic-tags';
import { createSuccessJson, noGetRoute, processApiError } from '~/utils/request-helpers';

export { noGetRoute as loader };

export async function action(args: ActionFunctionArgs) {
  const comicId = parseInt(args.params.id as string);
  if (isNaN(comicId)) {
    return createSuccessJson([]);
  }
  const tagsRes = await getComicTags(args.context.cloudflare.env.DB, comicId);

  if (tagsRes.err) {
    return processApiError('Error in /api/comics/:id/tags', tagsRes.err);
  }

  return createSuccessJson(tagsRes.result);
}
