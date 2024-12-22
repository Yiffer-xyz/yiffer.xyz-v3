import type { Blog } from '~/types/types';
import { queryDb } from '~/utils/database-facade';
import { parseDbDateStr } from '~/utils/date-utils';
import type { ResultOrErrorPromise } from '~/utils/request-helpers';
import { makeDbErrObj } from '~/utils/request-helpers';

type DbBlog = Omit<Blog, 'authorUser' | 'timestamp'> & {
  userId: number;
  username: string;
  timestamp: string;
};

export async function getLatestBlog(
  db: D1Database
): ResultOrErrorPromise<Blog | undefined> {
  const blogQuery = `
    SELECT blog.id, title, content, timestamp, user.id AS userId, user.username
    FROM blog
    INNER JOIN user ON blog.author = user.id
    ORDER BY blog.id DESC
    LIMIT 1
  `;

  const dbRes = await queryDb<DbBlog[]>(db, blogQuery, null, 'Latest blog');
  if (dbRes.isError || !dbRes.result) {
    return makeDbErrObj(dbRes, 'Error getting latest blog');
  }

  if (dbRes.result.length === 0) return { result: undefined };
  const blog = dbBlogToBlog(dbRes.result[0]);

  return { result: blog };
}

export async function getAllBlogs(db: D1Database): ResultOrErrorPromise<Blog[]> {
  const blogQuery = `
    SELECT blog.id, title, content, timestamp, user.id AS userId, user.username
    FROM blog
    INNER JOIN user ON blog.author = user.id
    ORDER BY timestamp DESC
  `;

  const dbRes = await queryDb<DbBlog[]>(db, blogQuery, null, 'All blogs');
  if (dbRes.isError || !dbRes.result) {
    return makeDbErrObj(dbRes, 'Error getting all blogs');
  }

  const blogs = dbRes.result.map(dbBlogToBlog);

  return { result: blogs };
}

export async function getBlogById(
  db: D1Database,
  blogId: number
): ResultOrErrorPromise<Blog | undefined> {
  const blogQuery = `
    SELECT blog.id, title, content, timestamp, user.id AS userId, user.username
    FROM blog
    INNER JOIN user ON blog.author = user.id
    WHERE blog.id = $1
  `;

  const dbRes = await queryDb<DbBlog[]>(db, blogQuery, [blogId], 'Blog by ID');
  if (dbRes.isError || !dbRes.result) {
    return makeDbErrObj(dbRes, 'Error getting blog by id');
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
    timestamp: parseDbDateStr(dbBlog.timestamp),
    authorUser: {
      id: dbBlog.userId,
      username: dbBlog.username,
    },
  };
}
