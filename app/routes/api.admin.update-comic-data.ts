import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import type { ComicDataChanges } from './admin.comics.$comic/LiveComic';
import type { DBResponse } from '~/utils/database-facade';
import { queryDb } from '~/utils/database-facade';
import { redirectIfNotMod } from '~/utils/loaders';
import type { ApiError } from '~/utils/request-helpers';
import {
  createSuccessJson,
  makeDbErr,
  processApiError,
  wrapApiError,
} from '~/utils/request-helpers';
import { getComicById } from '~/route-funcs/get-comic';

export async function action(args: ActionFunctionArgs) {
  const urlBase = args.context.DB_API_URL_BASE;
  await redirectIfNotMod(args);
  const formData = await args.request.formData();
  const body = JSON.parse(formData.get('body') as string) as ComicDataChanges;

  const err = await updateComicData(urlBase, body);
  if (err) {
    return processApiError(`Error in /update-comic-data`, err, body);
  }
  return createSuccessJson();
}

export async function updateComicData(
  urlBase: string,
  changes: ComicDataChanges
): Promise<ApiError | undefined> {
  const comicRes = await getComicById(urlBase, changes.comicId);
  if (comicRes.err) {
    return wrapApiError(comicRes.err, `Could not update comic data`, changes);
  }
  const existingComic = comicRes.result;

  if (changes.name) {
    const err = await updateComicName(
      urlBase,
      changes.comicId,
      existingComic.name,
      changes.name
    );
    if (err) {
      return wrapApiError(err, 'Could not update comic name', changes);
    }
  }
  if (changes.nextComicId) {
    const err = await updateComicLink(
      urlBase,
      changes.comicId,
      existingComic.nextComic?.id,
      changes.nextComicId,
      'next'
    );
    if (err) {
      return wrapApiError(err, 'Error updating comic links (next)', changes);
    }
  }
  if (changes.previousComicId) {
    const err = await updateComicLink(
      urlBase,
      changes.comicId,
      existingComic.previousComic?.id,
      changes.previousComicId,
      'prev'
    );
    if (err) {
      return wrapApiError(err, 'Error updating comic links (prev)', changes);
    }
  }
  if (changes.tagIds) {
    const err = await updateTags(
      urlBase,
      changes.comicId,
      existingComic.tags.map(t => t.id),
      changes.tagIds
    );
    if (err) {
      return wrapApiError(err, 'Error updating comic tags', changes);
    }
  }
  if (changes.category || changes.classification || changes.artistId || changes.state) {
    const err = await updateGeneralDetails(urlBase, changes);
    if (err) {
      return wrapApiError(err, 'Error updating general comic details', changes);
    }
  }
}

async function updateTags(
  urlBase: string,
  comicId: number,
  oldTagIds: number[],
  tagIds: number[]
): Promise<ApiError | undefined> {
  const logCtx = { comicId, oldTagIds, tagIds };
  const newTagIds = tagIds.filter(id => !oldTagIds.includes(id));
  const deletedTagIds = oldTagIds.filter(id => !tagIds.includes(id));

  const dbPromises: Promise<DBResponse<any>>[] = [];

  if (newTagIds.length > 0) {
    const newTagsQuery = `INSERT INTO comickeyword (comicId, keywordId) VALUES ${newTagIds
      .map(_ => `(?, ?)`)
      .join(', ')}`;
    dbPromises.push(
      queryDb(
        urlBase,
        newTagsQuery,
        newTagIds.flatMap(id => [comicId, id])
      )
    );
  }
  if (deletedTagIds.length > 0) {
    const deletedTagsQuery = `DELETE FROM comickeyword WHERE comicId = ? AND keywordId IN (${deletedTagIds
      .map(() => '?')
      .join(', ')})`;
    dbPromises.push(queryDb(urlBase, deletedTagsQuery, [comicId, ...deletedTagIds]));
  }

  const dbResponses = await Promise.all(dbPromises);

  for (const dbRes of dbResponses) {
    if (dbRes.isError) {
      return makeDbErr(dbRes, 'Error updating tags', logCtx);
    }
  }
}

async function updateGeneralDetails(
  urlBase: string,
  changes: ComicDataChanges
): Promise<ApiError | undefined> {
  let updateFieldStr = '';
  const updateFieldValues: any[] = [];
  if (changes.category) {
    updateFieldStr += 'tag = ?, ';
    updateFieldValues.push(changes.category);
  }
  if (changes.classification) {
    updateFieldStr += 'cat = ?, ';
    updateFieldValues.push(changes.classification);
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
  const dbRes = await queryDb(urlBase, updateQuery, updateFieldValues);
  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error updating comic details', changes);
  }
}

async function updateComicName(
  urlBase: string,
  comicId: number,
  oldName: string,
  newName: string
): Promise<ApiError | undefined> {
  return {
    logMessage: 'Not implemented!',
  };
}

async function updateComicLink(
  urlBase: string,
  comicId: number,
  oldLinkedId: number | undefined,
  newLinkedComicId: number | undefined,
  type: 'next' | 'prev'
): Promise<ApiError | undefined> {
  if (oldLinkedId === newLinkedComicId) return;
  const logCtx = { comicId, oldLinkedId, newLinkedComicId, type };

  if (oldLinkedId) {
    const deleteQuery = `DELETE FROM comiclink WHERE ${
      type === 'next' ? 'first' : 'last'
    }Comic = ?`;
    const delDbRes = await queryDb(urlBase, deleteQuery, [comicId]);
    if (delDbRes.isError) {
      return makeDbErr(delDbRes, 'Error deleting comic link', logCtx);
    }
  }
  if (newLinkedComicId) {
    const insertQuery = `INSERT INTO comiclink (firstComic, lastComic) VALUES (?, ?)`;
    const newDbRes = await queryDb(urlBase, insertQuery, [
      type === 'next' ? comicId : newLinkedComicId,
      type === 'next' ? newLinkedComicId : comicId,
    ]);
    if (newDbRes.isError) {
      return makeDbErr(newDbRes, 'Error inserting new comic link', logCtx);
    }
  }
}
