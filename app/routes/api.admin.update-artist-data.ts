import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import type { ArtistDataChanges } from './admin.artists.$artist/route';
import type { Artist } from '~/types/types';
import type { DBResponse } from '~/utils/database-facade';
import { queryDb } from '~/utils/database-facade';
import { isUsernameUrl } from '~/utils/general';
import { redirectIfNotMod } from '~/utils/loaders';
import type { ApiError } from '~/utils/request-helpers';
import {
  create400Json,
  createSuccessJson,
  makeDbErr,
  processApiError,
  wrapApiError,
} from '~/utils/request-helpers';
import { getArtistById } from '~/route-funcs/get-artist';

export async function action(args: ActionFunctionArgs) {
  const urlBase = args.context.DB_API_URL_BASE;
  await redirectIfNotMod(args);
  const formData = await args.request.formData();
  const body = JSON.parse(formData.get('body') as string) as ArtistDataChanges;

  if (body.e621Name && isUsernameUrl(body.e621Name)) {
    return create400Json('e621Name cannot be a URL');
  }
  if (body.patreonName && isUsernameUrl(body.patreonName)) {
    return create400Json('patreonName cannot be a URL');
  }

  const err = await updateArtistData(urlBase, body);
  if (err) {
    return processApiError('Errir in /update-artist-data', err);
  }
  return createSuccessJson();
}

export async function updateArtistData(
  urlBase: string,
  changes: ArtistDataChanges
): Promise<ApiError | undefined> {
  const promises: Promise<ApiError | undefined>[] = [];

  if (
    changes.name ||
    changes.e621Name !== undefined ||
    changes.patreonName !== undefined
  ) {
    promises.push(updateGeneralDetails(urlBase, changes));
  }
  if (changes.links) {
    const { artist, err: artistErr } = await getArtistById(urlBase, changes.artistId);
    if (artistErr) {
      return wrapApiError(artistErr, 'Error updating artist', changes);
    }
    promises.push(
      updateLinks(urlBase, changes.artistId, changes.links, artist as Artist)
    );
  }

  const maybeErrors = await Promise.all(promises);
  for (const err of maybeErrors) {
    if (err) {
      return wrapApiError(err, 'Error updating artist', changes);
    }
  }
}

async function updateLinks(
  urlBase: string,
  artistId: number,
  links: string[],
  existingArtist: Artist
): Promise<ApiError | undefined> {
  const newLinks = links.filter(l => !existingArtist.links.includes(l));
  const deletedLinks = existingArtist.links.filter(l => !links.includes(l));
  const dbPromises: Promise<DBResponse<any>>[] = [];

  if (newLinks.length > 0) {
    const addLinksQuery = `INSERT INTO artistlink (artistId, linkUrl) VALUES ${newLinks
      .map(() => '(?, ?)')
      .join(', ')}`;
    dbPromises.push(
      queryDb(
        urlBase,
        addLinksQuery,
        newLinks.flatMap(l => [artistId, l])
      )
    );
  }
  if (deletedLinks.length > 0) {
    const deleteLinksQuery = `DELETE FROM artistlink WHERE artistId = ? AND linkUrl IN (${deletedLinks
      .map(() => '?')
      .join(', ')})`;
    dbPromises.push(queryDb<any>(urlBase, deleteLinksQuery, [artistId, ...deletedLinks]));
  }

  const dbResponses = await Promise.all(dbPromises);
  for (const dbRes of dbResponses) {
    if (dbRes.isError) {
      return makeDbErr(dbRes, 'Error updating artist links', {
        artistId,
        links,
        existingArtist,
      });
    }
  }
}

async function updateGeneralDetails(
  urlBase: string,
  changes: ArtistDataChanges
): Promise<ApiError | undefined> {
  let updateFieldStr = '';
  const updateFieldValues: any[] = [];
  if (changes.name) {
    updateFieldStr += 'name = ?, ';
    updateFieldValues.push(changes.name.trim());
  }
  if (changes.e621Name !== undefined) {
    updateFieldStr += 'e621Name = ?, ';
    updateFieldValues.push(changes.e621Name.trim());
  }
  if (changes.patreonName !== undefined) {
    updateFieldStr += 'patreonName = ?, ';
    updateFieldValues.push(changes.patreonName.trim());
  }

  updateFieldStr = updateFieldStr.slice(0, -2);
  updateFieldValues.push(changes.artistId);

  const updateQuery = `UPDATE artist SET ${updateFieldStr} WHERE id = ?`;
  const dbRes = await queryDb(urlBase, updateQuery, updateFieldValues);
  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error updating artist details', { changes });
  }
}
