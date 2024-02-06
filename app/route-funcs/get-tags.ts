import type { DBInputWithErrMsg } from '~/utils/database-facade';
import { queryDb } from '~/utils/database-facade';
import type { Tag } from '~/types/types';
import type {
  ResultOrErrorPromise,
  ResultOrNotFoundOrErrorPromise,
} from '~/utils/request-helpers';
import { makeDbErrObj } from '~/utils/request-helpers';

export function getAllTagsQuery(): DBInputWithErrMsg {
  return {
    query: 'SELECT id, keywordName AS name FROM keyword',
    errorLogMessage: 'Error getting all tags',
  };
}

export async function getAllTags(db: D1Database): ResultOrErrorPromise<Tag[]> {
  const { query } = getAllTagsQuery();
  const dbRes = await queryDb<Tag[]>(db, query);
  if (dbRes.isError || !dbRes.result) {
    return makeDbErrObj(dbRes, 'Error getting all tags');
  }
  return { result: dbRes.result };
}

export async function getAllTagNames(db: D1Database): ResultOrErrorPromise<string[]> {
  const keywordsQuery = 'SELECT keywordName AS name FROM keyword';
  const dbRes = await queryDb<{ name: string }[]>(db, keywordsQuery);
  if (dbRes.isError || !dbRes.result) {
    return makeDbErrObj(dbRes, 'Error getting all tag names');
  }
  return { result: dbRes.result.map(tag => tag.name) };
}

export async function getTagById(
  db: D1Database,
  tagId: number
): ResultOrNotFoundOrErrorPromise<Tag> {
  const tagQuery = 'SELECT id, keywordName AS name FROM keyword WHERE id = ? LIMIT 1';

  const dbRes = await queryDb<Tag[]>(db, tagQuery, [tagId]);
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

  const dbRes = await queryDb<Tag[]>(db, tagQuery, [tagName]);
  if (dbRes.isError || !dbRes.result) {
    return makeDbErrObj(dbRes, 'Error getting tag', { tagName });
  }

  if (dbRes.result.length === 0) {
    return { notFound: true };
  }

  return { result: dbRes.result[0] };
}
