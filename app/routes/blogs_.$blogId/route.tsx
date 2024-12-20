import Breadcrumbs from '~/ui-components/Breadcrumbs/Breadcrumbs';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { getBlogById } from '~/route-funcs/get-blogs';
import { processApiError } from '~/utils/request-helpers';
import { format, formatDistanceToNow } from 'date-fns';
import type { Blog } from '~/types/types';
export { YifferErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction = ({ data }) => {
  const { blog, notFound } = data as LoaderData;
  if (notFound) {
    return [{ title: `Not found | Yiffer.xyz` }];
  }
  return [{ title: `Blog: ${blog?.title} | Yiffer.xyz` }];
};

type LoaderData = {
  notFound: boolean;
  blog: Blog | null;
  queryStr: string;
};

export async function loader(args: LoaderFunctionArgs) {
  const { blogId } = args.params;

  const res: LoaderData = {
    notFound: true,
    blog: null,
    queryStr: blogId ?? '',
  };

  if (!blogId) {
    return res;
  }

  const blogIdNum = parseInt(blogId, 10);
  if (isNaN(blogIdNum)) {
    return res;
  }

  const allBlogsRes = await getBlogById(args.context.cloudflare.env.DB, blogIdNum);

  if (allBlogsRes.err) {
    return processApiError('Error getting blog in /blogs/id loader', allBlogsRes.err, {
      blogIdNum,
    });
  }

  res.blog = allBlogsRes.result ?? null;
  res.notFound = !allBlogsRes.result;

  return res;
}

export default function BlogPage() {
  const { blog, notFound, queryStr } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto pb-8">
      <h1>Blog{blog?.title ? `: ${blog.title}` : ''}</h1>

      <Breadcrumbs
        prevRoutes={[{ text: 'Blogs', href: '/blogs' }]}
        currentRoute={blog?.title ?? queryStr ?? 'Blog'}
      />

      {notFound && <p>Blog not found</p>}

      {notFound === false && blog && (
        <div className="whitespace-pre-wrap -mt-2">
          <p className="text-sm">
            By {blog?.authorUser.username} - {format(blog?.timestamp, 'PPP')} (
            {formatDistanceToNow(blog?.timestamp)} ago)
          </p>
          <p className="mt-2">{blog?.content}</p>
        </div>
      )}
    </div>
  );
}
