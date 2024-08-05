import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import type { ComicDataChanges } from './admin.comics.$comic/LiveComic';
import type { QueryWithParams } from '~/utils/database-facade';
import { queryDbMultiple } from '~/utils/database-facade';
import { redirectIfNotMod } from '~/utils/loaders';
import type { ApiError } from '~/utils/request-helpers';
import {
  createSuccessJson,
  makeDbErr,
  processApiError,
  wrapApiError,
} from '~/utils/request-helpers';
import { getComicByField } from '~/route-funcs/get-comic';

export async function action(args: ActionFunctionArgs) {
  await redirectIfNotMod(args);
  const formData = await args.request.formData();
  const body = JSON.parse(formData.get('body') as string) as ComicDataChanges;

  const err = await updateComicData(args.context.DB, body);
  if (err) {
    return processApiError(`Error in /update-comic-data`, err, body);
  }
  return createSuccessJson();
}

export async function updateComicData(
  db: D1Database,
  changes: ComicDataChanges
): Promise<ApiError | undefined> {
  const comicRes = await getComicByField({
    db,
    fieldName: 'id',
    fieldValue: changes.comicId,
  });

  if (comicRes.err) {
    return wrapApiError(comicRes.err, `Could not update comic data`, changes);
  }
  if (comicRes.notFound) {
    return {
      logMessage: `Could not update comic data - comic not found`,
      context: changes,
    };
  }
  const existingComic = comicRes.result;

  const dbStatements: QueryWithParams[] = [];

  if (changes.name) {
    // IMPLEMENT WHEN STORAGE IS IN PLACE.
    // const err = await updateComicName(
    //   db,
    //   changes.comicId,
    //   existingComic.name,
    //   changes.name
    // );
    // if (err) {
    //   return wrapApiError(err, 'Could not update comic name', changes);
    // }
  }

  if (changes.nextComicId !== undefined) {
    // Add or replace next comic id; changes.nextComicId is null removed
    dbStatements.push(
      ...getUpdateComicLinkQuery(
        changes.comicId,
        existingComic.nextComic?.id,
        changes.nextComicId ?? undefined,
        'next'
      )
    );
  }

  if (changes.previousComicId !== undefined) {
    // Add or replace previous comic id; changes.previousComicId is null removed
    dbStatements.push(
      ...getUpdateComicLinkQuery(
        changes.comicId,
        existingComic.previousComic?.id,
        changes.previousComicId ?? undefined,
        'prev'
      )
    );
  }

  if (changes.tagIds) {
    dbStatements.push(
      ...getUpdateTagsQuery(
        changes.comicId,
        existingComic.tags.map(t => t.id),
        changes.tagIds
      )
    );
  }

  if (changes.category || changes.artistId || changes.state) {
    dbStatements.push(getUpdateGeneralDetailsQuery(changes));
  }

  const dbRes = await queryDbMultiple(db, dbStatements);
  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error updating various data in updateComicData', changes);
  }
}

function getUpdateTagsQuery(
  comicId: number,
  oldTagIds: number[],
  tagIds: number[]
): QueryWithParams[] {
  const newTagIds = tagIds.filter(id => !oldTagIds.includes(id));
  const deletedTagIds = oldTagIds.filter(id => !tagIds.includes(id));

  const dbStatements: QueryWithParams[] = [];

  if (newTagIds.length > 0) {
    const newTagsQuery = `INSERT INTO comickeyword (comicId, keywordId) VALUES ${newTagIds
      .map(_ => `(?, ?)`)
      .join(', ')}`;
    dbStatements.push({
      query: newTagsQuery,
      params: newTagIds.flatMap(id => [comicId, id]),
    });
  }
  if (deletedTagIds.length > 0) {
    const deletedTagsQuery = `DELETE FROM comickeyword WHERE comicId = ? AND keywordId IN (${deletedTagIds
      .map(() => '?')
      .join(', ')})`;
    dbStatements.push({
      query: deletedTagsQuery,
      params: [comicId, ...deletedTagIds],
    });
  }

  return dbStatements;
}

function getUpdateGeneralDetailsQuery(changes: ComicDataChanges): QueryWithParams {
  let updateFieldStr = '';
  const updateFieldValues: any[] = [];
  if (changes.category) {
    updateFieldStr += 'tag = ?, ';
    updateFieldValues.push(changes.category);
  }
  if (changes.artistId) {
    updateFieldStr += 'artist = ?, ';
    updateFieldValues.push(changes.artistId);
  }
  if (changes.state) {
    updateFieldStr += 'state = ?, ';
    updateFieldValues.push(changes.state);
  }

  updateFieldStr = updateFieldStr.slice(0, -2);
  updateFieldValues.push(changes.comicId);

  const updateQuery = `UPDATE comic SET ${updateFieldStr} WHERE id = ?`;

  return {
    query: updateQuery,
    params: updateFieldValues,
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function updateComicName(
  db: D1Database,
  comicId: number,
  oldName: string,
  newName: string
): Promise<ApiError | undefined> {
  return {
    logMessage: 'Not implemented!',
  };
}

function getUpdateComicLinkQuery(
  comicId: number,
  oldLinkedId: number | undefined,
  newLinkedComicId: number | undefined,
  type: 'next' | 'prev'
): QueryWithParams[] {
  if (oldLinkedId === newLinkedComicId) return [];
  const dbStatements: QueryWithParams[] = [];

  if (oldLinkedId) {
    dbStatements.push({
      query: `DELETE FROM comiclink WHERE ${type === 'next' ? 'first' : 'last'}Comic = ?`,
      params: [comicId],
    });
  }
  if (newLinkedComicId) {
    dbStatements.push({
      query: `INSERT INTO comiclink (firstComic, lastComic) VALUES (?, ?)`,
      params: [
        type === 'next' ? comicId : newLinkedComicId,
        type === 'next' ? newLinkedComicId : comicId,
      ],
    });
  }

  return dbStatements;
}
