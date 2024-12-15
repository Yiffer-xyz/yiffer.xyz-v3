import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { getLatestBlog } from '~/route-funcs/get-blogs';
import { createSuccessJson, noGetRoute, processApiError } from '~/utils/request-helpers';

export { noGetRoute as loader };

export async function action(args: ActionFunctionArgs) {
  const blogRes = await getLatestBlog(args.context.cloudflare.env.DB);

  if (blogRes.err) {
    return processApiError('Error in /latest-blog', blogRes.err);
  }

  return createSuccessJson(blogRes.result);
}
