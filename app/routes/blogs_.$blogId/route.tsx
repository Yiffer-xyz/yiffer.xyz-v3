import Breadcrumbs from '~/ui-components/Breadcrumbs/Breadcrumbs';
import { unstable_defineLoader } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { getBlogById } from '~/route-funcs/get-blogs';
import { processApiError } from '~/utils/request-helpers';

export const loader = unstable_defineLoader(async args => {
  const { blogId } = args.params;

  if (!blogId) {
    console.log('no id');
    return { notFound: true, blog: null, queryStr: blogId };
  }

  const blogIdNum = parseInt(blogId, 10);
  if (isNaN(blogIdNum)) {
    return { notFound: true, blog: null, queryStr: blogId };
  }

  const allBlogsRes = await getBlogById(args.context.cloudflare.env.DB, blogIdNum);

  if (allBlogsRes.err) {
    return processApiError('Error getting blog in /blogs/id loader', allBlogsRes.err, {
      blogIdNum,
    });
  }

  return {
    notFound: false,
    blog: allBlogsRes.result,
    queryStr: blogId,
  };
});

export default function BlogPage() {
  const { blog, notFound, queryStr } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto pb-8">
      <h1>Blog{blog?.title ? `: ${blog.title}` : ''}</h1>

      <Breadcrumbs
        prevRoutes={[{ text: 'Blogs', href: '/blogs' }]}
        currentRoute={blog?.title ?? queryStr ?? 'Blog'}
      />

      {notFound === false ? (
        <pre>{JSON.stringify(blog, null, 2)}</pre>
      ) : (
        <p>Blog not found</p>
      )}
    </div>
  );
}
