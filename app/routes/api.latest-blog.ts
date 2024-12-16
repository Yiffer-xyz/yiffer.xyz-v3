import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { getLatestBlog } from '~/route-funcs/get-blogs';
import { createSuccessJson, processApiError } from '~/utils/request-helpers';

export async function loader(args: LoaderFunctionArgs) {
  const blogRes = await getLatestBlog(args.context.cloudflare.env.DB);

  if (blogRes.err) {
    return processApiError('Error in /latest-blog', blogRes.err);
  }

  return createSuccessJson(blogRes.result);
}
