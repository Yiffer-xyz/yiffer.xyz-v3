import { ActionArgs, json } from '@remix-run/cloudflare';
import { ComicDataChanges } from '~/routes/admin/comics/LiveComic';
import { queryDbDirect } from '~/utils/database-facade';
import { redirectIfNotMod } from '~/utils/loaders';
import {
  create500Json,
  createGeneric500Json,
  createSuccessJson,
} from '~/utils/request-helpers';
import { getComicById } from '../funcs/get-comic';

export async function action(args: ActionArgs) {
  const urlBase = args.context.DB_API_URL_BASE as string;
  await redirectIfNotMod(args);
  const formData = await args.request.formData();
  const body = JSON.parse(formData.get('body') as string) as ComicDataChanges;

  try {
    await updateComicData(urlBase, body);
  } catch (e) {
    return e instanceof Error ? create500Json(e.message) : createGeneric500Json();
  }

  return createSuccessJson();
}

export async function updateComicData(urlBase: string, changes: ComicDataChanges) {
  const existingComic = await getComicById(urlBase, changes.comicId);

  if (changes.name) {
    await updateComicName(urlBase, changes.comicId, existingComic.name, changes.name);
  }
  if (changes.nextComicId) {
    await updateComicLink(
      urlBase,
      changes.comicId,
      existingComic.nextComic?.id,
      changes.nextComicId,
      'next'
    );
  }
  if (changes.previousComicId) {
    await updateComicLink(
      urlBase,
      changes.comicId,
      existingComic.previousComic?.id,
      changes.previousComicId,
      'prev'
    );
  }
  if (changes.tagIds) {
    await updateTags(
      urlBase,
      changes.comicId,
      existingComic.tags.map(t => t.id),
      changes.tagIds
    );
  }
  if (changes.category || changes.classification || changes.artistId || changes.state) {
    await updateGeneralDetails(urlBase, changes);
  }

  const comic = await getComicById(urlBase, existingComic.id);

  return json(
    { success: true, error: true, updatedComic: JSON.stringify(comic), data: 'ragnar' },
    { status: 200 }
  );
}

async function updateTags(
  urlBase: string,
  comicId: number,
  oldTagIds: number[],
  tagIds: number[]
) {
  const newTagIds = tagIds.filter(id => !oldTagIds.includes(id));
  const deletedTagIds = oldTagIds.filter(id => !tagIds.includes(id));

  let addPromise: Promise<any> = Promise.resolve();
  let deletePromise: Promise<any> = Promise.resolve();
  if (newTagIds.length > 0) {
    const newTagsQuery = `INSERT INTO comickeyword (comicId, keywordId) VALUES ${newTagIds
      .map(_ => `(?, ?)`)
      .join(', ')}`;
    addPromise = queryDbDirect(
      urlBase,
      newTagsQuery,
      newTagIds.flatMap(id => [comicId, id])
    );
  }
  if (deletedTagIds.length > 0) {
    const deletedTagsQuery = `DELETE FROM comickeyword WHERE comicId = ? AND keywordId IN (${deletedTagIds
      .map(() => '?')
      .join(', ')})`;
    deletePromise = queryDbDirect(urlBase, deletedTagsQuery, [comicId, ...deletedTagIds]);
  }

  await Promise.all([addPromise, deletePromise]);
}

async function updateGeneralDetails(urlBase: string, changes: ComicDataChanges) {
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
  await queryDbDirect(urlBase, updateQuery, updateFieldValues);
}

async function updateComicName(
  urlBase: string,
  comicId: number,
  oldName: string,
  newName: string
) {
  throw new Error('Not implemented yet'); // TODO: Implement this later
}

async function updateComicLink(
  urlBase: string,
  comicId: number,
  oldLinkedId: number | undefined,
  newLinkedComicId: number | undefined,
  type: 'next' | 'prev'
) {
  if (oldLinkedId === newLinkedComicId) return;

  if (oldLinkedId) {
    const deleteQuery = `DELETE FROM comiclink WHERE ${
      type === 'next' ? 'first' : 'last'
    }Comic = ?`;
    await queryDbDirect(urlBase, deleteQuery, [comicId]);
  }
  if (newLinkedComicId) {
    const insertQuery = `INSERT INTO comiclink (firstComic, lastComic) VALUES (?, ?)`;
    await queryDbDirect(urlBase, insertQuery, [
      type === 'next' ? comicId : newLinkedComicId,
      type === 'next' ? newLinkedComicId : comicId,
    ]);
  }
}
