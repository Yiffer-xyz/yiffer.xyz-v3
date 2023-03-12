import { ActionArgs } from '@remix-run/cloudflare';
import { ArtistDataChanges } from '~/routes/admin/artists/$artist';
import { Artist } from '~/types/types';
import { queryDbDirect } from '~/utils/database-facade';
import { redirectIfNotMod } from '~/utils/loaders';
import {
  create500Json,
  createGeneric500Json,
  createSuccessJson,
} from '~/utils/request-helpers';
import { getArtistById } from '../funcs/get-artist';

export async function action(args: ActionArgs) {
  const urlBase = args.context.DB_API_URL_BASE as string;
  await redirectIfNotMod(args);
  const formData = await args.request.formData();
  const body = JSON.parse(formData.get('body') as string) as ArtistDataChanges;

  try {
    await updateArtistData(urlBase, body);
  } catch (e) {
    return e instanceof Error ? create500Json(e.message) : createGeneric500Json();
  }

  return createSuccessJson();
}

export async function updateArtistData(urlBase: string, changes: ArtistDataChanges) {
  let promises: Promise<any>[] = [];

  if (
    changes.name ||
    changes.e621Name !== undefined ||
    changes.patreonName !== undefined
  ) {
    promises.push(updateGeneralDetails(urlBase, changes));
  }
  if (changes.links) {
    const existingArtist = await getArtistById(urlBase, changes.artistId);
    promises.push(updateLinks(urlBase, changes.artistId, changes.links, existingArtist));
  }

  await Promise.all(promises);
  return createSuccessJson();
}

async function updateLinks(
  urlBase: string,
  artistId: number,
  links: string[],
  existingArtist: Artist
) {
  const newLinks = links.filter(l => !existingArtist.links.includes(l));
  const deletedLinks = existingArtist.links.filter(l => !links.includes(l));

  let addPromise: Promise<any> = Promise.resolve();
  let deletePromise: Promise<any> = Promise.resolve();
  if (newLinks.length > 0) {
    const addLinksQuery = `INSERT INTO artistlink (artistId, linkUrl) VALUES ${newLinks
      .map(() => '(?, ?)')
      .join(', ')}`;
    addPromise = queryDbDirect(
      urlBase,
      addLinksQuery,
      newLinks.flatMap(l => [artistId, l])
    );
  }
  if (deletedLinks.length > 0) {
    const deleteLinksQuery = `DELETE FROM artistlink WHERE artistId = ? AND linkUrl IN (${deletedLinks
      .map(() => '?')
      .join(', ')})`;
    deletePromise = queryDbDirect(urlBase, deleteLinksQuery, [artistId, ...deletedLinks]);
  }

  await Promise.all([addPromise, deletePromise]);
}

async function updateGeneralDetails(urlBase: string, changes: ArtistDataChanges) {
  let updateFieldStr = '';
  let updateFieldValues: any[] = [];
  if (changes.name) {
    updateFieldStr += 'name = ?, ';
    updateFieldValues.push(changes.name);
  }
  if (changes.e621Name !== undefined) {
    updateFieldStr += 'e621Name = ?, ';
    updateFieldValues.push(changes.e621Name);
  }
  if (changes.patreonName !== undefined) {
    updateFieldStr += 'patreonName = ?, ';
    updateFieldValues.push(changes.patreonName);
  }

  updateFieldStr = updateFieldStr.slice(0, -2);
  updateFieldValues.push(changes.artistId);

  const updateQuery = `UPDATE artist SET ${updateFieldStr} WHERE id = ?`;
  await queryDbDirect(urlBase, updateQuery, updateFieldValues);
}
