import type { Blog } from '~/types/types';
import { queryDb } from '~/utils/database-facade';
import type { ResultOrErrorPromise } from '~/utils/request-helpers';
import { makeDbErrObj } from '~/utils/request-helpers';

type DbBlog = Omit<Blog, 'authorUser'> & { userId: number; username: string };

// Here, later: get all blogs, etc. For mod panel.

export async function getLatestBlog(
  urlBase: string
): ResultOrErrorPromise<Blog | undefined> {
  const blogQuery = `
    SELECT blog.id, title, content, timestamp, user.id AS userId, user.username
    FROM blog
    INNER JOIN user ON blog.author = user.id
    ORDER BY timestamp DESC
    LIMIT 1
  `;

  const dbRes = await queryDb<DbBlog[]>(urlBase, blogQuery);
  if (dbRes.isError || !dbRes.result) {
    return makeDbErrObj(dbRes, 'Error getting latest blog');
  }

  if (dbRes.result.length === 0) return { result: undefined };
  const blog = dbBlogToBlog(dbRes.result[0]);
  return { result: blog };
}

function dbBlogToBlog(dbBlog: DbBlog): Blog {
  return {
    id: dbBlog.id,
    title: dbBlog.title,
    content: dbBlog.content,
    timestamp: dbBlog.timestamp,
    authorUser: {
      id: dbBlog.userId,
      username: dbBlog.username,
    },
  };
}
