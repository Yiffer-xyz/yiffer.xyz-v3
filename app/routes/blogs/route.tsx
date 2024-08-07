import Breadcrumbs from '~/ui-components/Breadcrumbs/Breadcrumbs';
import { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import Link from '~/ui-components/Link';
import { getAllBlogs } from '~/route-funcs/get-blogs';
import { processApiError } from '~/utils/request-helpers';
import { Table, TableBody, TableCell, TableRow } from '~/ui-components/Table';
import { format } from 'date-fns';
import useWindowSize from '~/utils/useWindowSize';

export async function loader(args: LoaderFunctionArgs) {
  const allBlogsRes = await getAllBlogs(args.context.DB);

  if (allBlogsRes.err) {
    return processApiError('Error getting all blogs in /blogs loader', allBlogsRes.err);
  }

  return {
    blogs: allBlogsRes.result,
  };
}

export default function BlogPage() {
  const { blogs } = useLoaderData<typeof loader>();
  const { isMobile } = useWindowSize();

  return (
    <div className="container mx-auto pb-8">
      <h1>Blogs</h1>

      <Breadcrumbs prevRoutes={[]} currentRoute="Blogs" />

      {blogs.length === 0 ? (
        <p>No blogs found.</p>
      ) : (
        <Table className="w-full sm:w-fit">
          <TableBody>
            <TableRow includeBorderTop>
              <TableCell>
                <Link
                  href={`/blogs/${blogs[0].id}`}
                  text={blogs[0].title}
                  showRightArrow
                />
                {isMobile && <p>{format(new Date(blogs[0].timestamp), 'PPP')}</p>}
              </TableCell>
              {!isMobile && (
                <TableCell>{format(new Date(blogs[0].timestamp), 'PPP')}</TableCell>
              )}
            </TableRow>
            {blogs.slice(1).map(blog => (
              <TableRow key={blog.id}>
                <TableCell>
                  <Link href={`/blogs/${blog.id}`} text={blog.title} showRightArrow />
                  {isMobile && <p>{format(new Date(blog.timestamp), 'PPP')}</p>}
                </TableCell>
                {!isMobile && (
                  <TableCell>{format(new Date(blog.timestamp), 'PPP')}</TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
