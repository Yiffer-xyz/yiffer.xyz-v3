import { ActionArgs } from '@remix-run/cloudflare';
import { ComicDataChanges } from '~/routes/admin/comics/LiveComic';
import { Comic } from '~/types/types';
import { DBResponse, queryDb } from '~/utils/database-facade';
import { redirectIfNotMod } from '~/utils/loaders';
import {
  ApiError,
  createSuccessJson,
  makeDbErr,
  processApiError,
  wrapApiError,
} from '~/utils/request-helpers';
import { getComicById } from '../funcs/get-comic';

export async function action(args: ActionArgs) {
  const urlBase = args.context.DB_API_URL_BASE as string;
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
  let { comic: existingComic, err } = await getComicById(urlBase, changes.comicId);
  if (err) {
    return wrapApiError(err, `Could not update comic data`, changes);
  }
  existingComic = existingComic as Comic;

  if (changes.name) {
    err = await updateComicName(
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
    err = await updateComicLink(
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
    err = await updateComicLink(
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
    err = await updateTags(
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
    err = await updateGeneralDetails(urlBase, changes);
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

  for (let dbRes of dbResponses) {
    if (dbRes.errorMessage) {
      return makeDbErr(dbRes, 'Error updating tags', logCtx);
    }
  }
}

async function updateGeneralDetails(
  urlBase: string,
  changes: ComicDataChanges
): Promise<ApiError | undefined> {
  let updateFieldStr = '';
  let updateFieldValues: any[] = [];
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
  if (dbRes.errorMessage) {
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
    if (delDbRes.errorMessage) {
      return makeDbErr(delDbRes, 'Error deleting comic link', logCtx);
    }
  }
  if (newLinkedComicId) {
    const insertQuery = `INSERT INTO comiclink (firstComic, lastComic) VALUES (?, ?)`;
    const newDbRes = await queryDb(urlBase, insertQuery, [
      type === 'next' ? comicId : newLinkedComicId,
      type === 'next' ? newLinkedComicId : comicId,
    ]);
    if (newDbRes.errorMessage) {
      return makeDbErr(newDbRes, 'Error inserting new comic link', logCtx);
    }
  }
}
