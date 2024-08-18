import { unstable_defineLoader } from '@remix-run/cloudflare';
import { getLatestBlog } from '~/route-funcs/get-blogs';
import { createSuccessJson, processApiError } from '~/utils/request-helpers';

export const loader = unstable_defineLoader(async args => {
  const blogRes = await getLatestBlog(args.context.cloudflare.env.DB);

  if (blogRes.err) {
    return processApiError('Error in /latest-blog', blogRes.err);
  }

  return createSuccessJson(blogRes.result);
});
