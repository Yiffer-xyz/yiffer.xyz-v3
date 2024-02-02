import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { getAllTags } from '~/route-funcs/get-tags';
import { createSuccessJson, processApiError } from '~/utils/request-helpers';

export async function loader(args: ActionFunctionArgs) {
  const urlBase = args.context.DB_API_URL_BASE;

  const tagsRes = await getAllTags(urlBase);

  if (tagsRes.err) {
    return processApiError('Error in /tags', tagsRes.err);
  }

  return createSuccessJson(tagsRes.result);
}
