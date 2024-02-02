import { queryDb } from '~/utils/database-facade';
import type { Tag } from '~/types/types';
import type {
  ResultOrErrorPromise,
  ResultOrNotFoundOrErrorPromise,
} from '~/utils/request-helpers';
import { makeDbErrObj } from '~/utils/request-helpers';

export async function getAllTags(urlBase: string): ResultOrErrorPromise<Tag[]> {
  const keywordsQuery = 'SELECT id, keywordName AS name FROM keyword';
  const dbRes = await queryDb<Tag[]>(urlBase, keywordsQuery);
  if (dbRes.isError || !dbRes.result) {
    return makeDbErrObj(dbRes, 'Error getting all tags');
  }
  return { result: dbRes.result };
}

export async function getAllTagNames(urlBase: string): ResultOrErrorPromise<string[]> {
  const keywordsQuery = 'SELECT keywordName AS name FROM keyword';
  const dbRes = await queryDb<{ name: string }[]>(urlBase, keywordsQuery);
  if (dbRes.isError || !dbRes.result) {
    return makeDbErrObj(dbRes, 'Error getting all tag names');
  }
  return { result: dbRes.result.map(tag => tag.name) };
}

export async function getTagById(
  urlBase: string,
  tagId: number
): ResultOrNotFoundOrErrorPromise<Tag> {
  const tagQuery = 'SELECT id, keywordName AS name FROM keyword WHERE id = ?';

  const dbRes = await queryDb<Tag[]>(urlBase, tagQuery, [tagId]);
  if (dbRes.isError || !dbRes.result) {
    return makeDbErrObj(dbRes, 'Error getting tag', { tagId });
  }

  if (dbRes.result.length === 0) {
    return { notFound: true };
  }

  return { result: dbRes.result[0] };
}

export async function getTagByName(
  urlBase: string,
  tagName: string
): ResultOrNotFoundOrErrorPromise<Tag> {
  const tagQuery = 'SELECT id, keywordName AS name FROM keyword WHERE keywordName = ?';

  const dbRes = await queryDb<Tag[]>(urlBase, tagQuery, [tagName]);
  if (dbRes.isError || !dbRes.result) {
    return makeDbErrObj(dbRes, 'Error getting tag', { tagName });
  }

  if (dbRes.result.length === 0) {
    return { notFound: true };
  }

  return { result: dbRes.result[0] };
}
