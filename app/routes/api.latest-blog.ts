import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { getLatestBlog } from '~/route-funcs/get-blogs';
import { createSuccessJson, processApiError } from '~/utils/request-helpers';

export async function loader(args: ActionFunctionArgs) {
  const blogRes = await getLatestBlog(args.context.DB);

  if (blogRes.err) {
    return processApiError('Error in /latest-blog', blogRes.err);
  }

  return createSuccessJson(blogRes.result);
}
