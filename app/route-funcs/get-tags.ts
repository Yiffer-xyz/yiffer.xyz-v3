import type { QueryWithParams } from '~/utils/database-facade';
import { queryDb } from '~/utils/database-facade';
import type { Tag } from '~/types/types';
import type {
  ResultOrErrorPromise,
  ResultOrNotFoundOrErrorPromise,
} from '~/utils/request-helpers';
import { makeDbErrObj } from '~/utils/request-helpers';

export function getAllTagsQuery(): QueryWithParams {
  return {
    query: 'SELECT id, keywordName AS name FROM keyword',
    queryName: 'Tags, all',
  };
}

export async function getAllTags(db: D1Database): ResultOrErrorPromise<Tag[]> {
  const { query } = getAllTagsQuery();
  const dbRes = await queryDb<Tag[]>(db, query, null, 'Tags, all');
  if (dbRes.isError || !dbRes.result) {
    return makeDbErrObj(dbRes, 'Error getting all tags');
  }
  return { result: dbRes.result };
}

export async function getAllTagNames(db: D1Database): ResultOrErrorPromise<string[]> {
  const keywordsQuery = 'SELECT keywordName AS name FROM keyword';
  const dbRes = await queryDb<{ name: string }[]>(
    db,
    keywordsQuery,
    null,
    'Tags, all names'
  );
  if (dbRes.isError || !dbRes.result) {
    return makeDbErrObj(dbRes, 'Error getting all tag names');
  }
  return { result: dbRes.result.map(tag => tag.name) };
}

export async function getTagsWithUsageCount(db: D1Database): ResultOrErrorPromise<
  {
    tag: Tag;
    count: number;
  }[]
> {
  const tagCountQuery = `
    SELECT keyword.id, keyword.keywordName AS name, COUNT(comicKeyword.keywordId) AS count
    FROM keyword
    LEFT JOIN comicKeyword ON keyword.id = comicKeyword.keywordId
    GROUP BY keyword.id
    ORDER BY count DESC
  `;

  const dbRes = await queryDb<{ id: number; name: string; count: number }[]>(
    db,
    tagCountQuery,
    null,
    'Tags with usage count'
  );
  if (dbRes.isError || !dbRes.result) {
    return makeDbErrObj(dbRes, 'Error getting tags with usage count');
  }

  return {
    result: dbRes.result.map(row => ({
      tag: { id: row.id, name: row.name },
      count: row.count,
    })),
  };
}

export async function getTagById(
  db: D1Database,
  tagId: number
): ResultOrNotFoundOrErrorPromise<Tag> {
  const tagQuery = 'SELECT id, keywordName AS name FROM keyword WHERE id = ? LIMIT 1';

  const dbRes = await queryDb<Tag[]>(db, tagQuery, [tagId], 'Tag by ID');
  if (dbRes.isError || !dbRes.result) {
    return makeDbErrObj(dbRes, 'Error getting tag', { tagId });
  }

  if (dbRes.result.length === 0) {
    return { notFound: true };
  }

  return { result: dbRes.result[0] };
}

export async function getTagByName(
  db: D1Database,
  tagName: string
): ResultOrNotFoundOrErrorPromise<Tag> {
  const tagQuery =
    'SELECT id, keywordName AS name FROM keyword WHERE keywordName = ? LIMIT 1';

  const dbRes = await queryDb<Tag[]>(db, tagQuery, [tagName], 'Tag by name');
  if (dbRes.isError || !dbRes.result) {
    return makeDbErrObj(dbRes, 'Error getting tag', { tagName });
  }

  if (dbRes.result.length === 0) {
    return { notFound: true };
  }

  return { result: dbRes.result[0] };
}
