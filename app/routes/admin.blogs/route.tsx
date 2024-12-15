import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import {
  Outlet,
  useLoaderData,
  useLocation,
  useNavigate,
  useOutletContext,
} from '@remix-run/react';
import { format } from 'date-fns';
import { MdAdd } from 'react-icons/md';
import { getAllBlogs } from '~/route-funcs/get-blogs';
import Button from '~/ui-components/Buttons/Button';
import Link from '~/ui-components/Link';
import { Table, TableBody, TableCell, TableRow } from '~/ui-components/Table';
import { processApiError } from '~/utils/request-helpers';
import useWindowSize from '~/utils/useWindowSize';
import type { GlobalAdminContext } from '../admin/route';
export { AdminErrorBoundary as ErrorBoundary } from '~/utils/error';

export async function loader(args: LoaderFunctionArgs) {
  const blogs = await getAllBlogs(args.context.cloudflare.env.DB);
  if (blogs.err) {
    return processApiError('Error getting all blogs in /admin/blogs loader', blogs.err);
  }
  return { blogs: blogs.result };
}

export default function Stats() {
  const globalContext: GlobalAdminContext = useOutletContext();
  const { blogs } = useLoaderData<typeof loader>();
  const { isMobile } = useWindowSize();
  const navigate = useNavigate();

  const { pathname } = useLocation();
  const isCreatingOrEditing =
    pathname.includes('/new') || pathname.match(/^\/admin\/blogs\/[^\/]+$/);

  return (
    <>
      <h1>Blogs</h1>

      <Outlet context={globalContext} />

      {!isCreatingOrEditing && (
        <>
          <Button
            text="New blog"
            startIcon={MdAdd}
            className="mb-4 mt-4"
            onClick={() => {
              navigate('/admin/blogs/new');
            }}
          />

          {blogs.length === 0 ? (
            <p>No blogs found.</p>
          ) : (
            <Table className="w-full sm:w-fit mt-6">
              <TableBody>
                <TableRow includeBorderTop>
                  <TableCell>
                    <Link
                      href={`/admin/blogs/${blogs[0].id}`}
                      text={blogs[0].title}
                      showRightArrow
                    />
                    {isMobile && <p>{format(blogs[0].timestamp, 'PPP')}</p>}
                  </TableCell>
                  {!isMobile && (
                    <TableCell>{format(blogs[0].timestamp, 'PPP')}</TableCell>
                  )}
                </TableRow>
                {blogs.slice(1).map(blog => (
                  <TableRow key={blog.id}>
                    <TableCell>
                      <Link
                        href={`/admin/blogs/${blog.id}`}
                        text={blog.title}
                        showRightArrow
                      />
                      {isMobile && <p>{format(blog.timestamp, 'PPP')}</p>}
                    </TableCell>
                    {!isMobile && <TableCell>{format(blog.timestamp, 'PPP')}</TableCell>}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </>
      )}
    </>
  );
}
