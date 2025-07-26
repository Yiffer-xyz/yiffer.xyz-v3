import type { ComicDataChanges } from './admin.comics.$comic/LiveComic';
import type { QueryWithParams } from '~/utils/database-facade';
import { queryDb, queryDbMultiple } from '~/utils/database-facade';
import { redirectIfNotMod } from '~/utils/loaders';
import type { ApiError, noGetRoute, ResultOrErrorPromise } from '~/utils/request-helpers';
import {
  createSuccessJson,
  makeDbErr,
  makeDbErrObj,
  processApiError,
  wrapApiError,
} from '~/utils/request-helpers';
import { getComicByField } from '~/route-funcs/get-comic';
import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { recalculateComicsPaginated } from '~/route-funcs/get-and-cache-comicspaginated';
import { addModLogAndPoints } from '~/route-funcs/add-mod-log-and-points';
import { capitalizeString } from '~/utils/general';

export { noGetRoute as loader };

export async function action(args: ActionFunctionArgs) {
  const user = await redirectIfNotMod(args);

  const formData = await args.request.formData();
  const body = JSON.parse(formData.get('body') as string) as ComicDataChanges;

  const err = await updateComicData(args.context.cloudflare.env.DB, body, user.userId);
  if (err) {
    return processApiError(`Error in /update-comic-data`, err, body);
  }
  return createSuccessJson();
}

export async function updateComicData(
  db: D1Database,
  changes: ComicDataChanges,
  userId: number
): Promise<ApiError | undefined> {
  const dataUpdatedTexts: string[] = [];
  let isTagsUpdated = false;

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
    dataUpdatedTexts.push(`new name: ${changes.name}`);
    dbStatements.push({
      query: `UPDATE comic SET name = ? WHERE id = ?`,
      params: [changes.name, changes.comicId],
    });
  }

  if (changes.nextComicId !== undefined) {
    // Add or replace next comic id; changes.nextComicId is null removed
    dataUpdatedTexts.push(`next comic`);
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
    dataUpdatedTexts.push(`previous comic`);
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
    isTagsUpdated = true;
    dbStatements.push(
      ...getUpdateTagsQuery(
        changes.comicId,
        existingComic.tags.map(t => t.id),
        changes.tagIds
      )
    );
  }

  if (
    changes.category ||
    changes.artistId ||
    changes.state ||
    changes.numberOfPages ||
    changes.updateUpdatedTime
  ) {
    if (changes.category) dataUpdatedTexts.push(`category: ${changes.category}`);
    if (changes.artistId) dataUpdatedTexts.push(`artist`);
    if (changes.state) dataUpdatedTexts.push(`state: ${changes.state}`);
    dbStatements.push(getUpdateGeneralDetailsQuery(changes));
  }

  const dbRes = await queryDbMultiple(db, dbStatements);
  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error updating various data in updateComicData', changes);
  }

  const recalcRes = await recalculateComicsPaginated(db);
  if (recalcRes) return wrapApiError(recalcRes, 'Error in updateComicData', changes);

  // Below: Mod logs
  if (dataUpdatedTexts.length > 0) {
    const modLogErr = await addModLogAndPoints({
      db,
      userId,
      comicId: changes.comicId,
      actionType: 'comic-data-updated',
      text: dataUpdatedTexts.join(', '),
    });
    if (modLogErr) {
      return wrapApiError(modLogErr, 'Error in updateComicData', changes);
    }
  }

  if (isTagsUpdated) {
    const newTagIds = changes.tagIds
      ? changes.tagIds.filter(id => !existingComic.tags.map(t => t.id).includes(id))
      : [];
    const deletedTagIds = existingComic.tags
      .map(t => t.id)
      .filter(id => !changes.tagIds?.includes(id));
    const tagNamesRes = await getTagNames(db, deletedTagIds, newTagIds);

    if (tagNamesRes.err) {
      return wrapApiError(tagNamesRes.err, 'Error in updateComicData', changes);
    }

    let tagNamesText = '';
    if (tagNamesRes.result.removedTagNames.length > 0) {
      tagNamesText += `Removed: ${tagNamesRes.result.removedTagNames.join(', ')}`;
    }
    if (tagNamesRes.result.newTagNames.length > 0) {
      const maybeNewline = tagNamesText.length > 0 ? '\n' : '';
      tagNamesText += `${maybeNewline}Added: ${tagNamesRes.result.newTagNames.join(', ')}`;
    }

    const modLogErr = await addModLogAndPoints({
      db,
      userId,
      comicId: changes.comicId,
      actionType: 'comic-tags-updated',
      text: capitalizeString(tagNamesText),
    });
    if (modLogErr) {
      return wrapApiError(modLogErr, 'Error in updateComicData', changes);
    }
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

async function getTagNames(
  db: D1Database,
  removedTagIds: number[],
  newTagIds: number[]
): ResultOrErrorPromise<{ removedTagNames: string[]; newTagNames: string[] }> {
  const allTagIds = [...removedTagIds, ...newTagIds];
  const tagNamesQuery = `SELECT id, keywordName AS name FROM keyword WHERE id IN (${allTagIds
    .map(() => '?')
    .join(', ')})`;
  const params = allTagIds.map(id => id);

  const tagNamesRes = await queryDb<{ id: number; name: string }[]>(
    db,
    tagNamesQuery,
    params,
    'Tag names by id'
  );

  if (tagNamesRes.isError) {
    return makeDbErrObj(tagNamesRes, 'Error getting tag names by id', allTagIds);
  }

  const removedTagNames: string[] = [];
  const newTagNames: string[] = [];
  for (const tag of tagNamesRes.result) {
    if (removedTagIds.includes(tag.id)) {
      removedTagNames.push(tag.name);
    }
    if (newTagIds.includes(tag.id)) {
      newTagNames.push(tag.name);
    }
  }

  return { result: { removedTagNames, newTagNames } };
}

function getUpdateGeneralDetailsQuery(changes: ComicDataChanges): QueryWithParams {
  let updateFieldStr = '';
  const updateFieldValues: any[] = [];
  if (changes.category) {
    updateFieldStr += 'category = ?, ';
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
  if (changes.numberOfPages) {
    updateFieldStr += 'numberOfPages = ?, ';
    updateFieldValues.push(changes.numberOfPages);
  }
  if (changes.updateUpdatedTime) {
    updateFieldStr += 'updated = CURRENT_TIMESTAMP, ';
  }

  updateFieldStr = updateFieldStr.slice(0, -2);
  updateFieldValues.push(changes.comicId);

  const updateQuery = `UPDATE comic SET ${updateFieldStr} WHERE id = ?`;

  return {
    query: updateQuery,
    params: updateFieldValues,
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
