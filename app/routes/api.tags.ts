import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { getAllTags } from '~/route-funcs/get-tags';
import { createSuccessJson, processApiError } from '~/utils/request-helpers';

export async function loader(args: ActionFunctionArgs) {
  const tagsRes = await getAllTags(args.context.DB);

  if (tagsRes.err) {
    return processApiError('Error in /tags', tagsRes.err);
  }

  return createSuccessJson(tagsRes.result);
}
