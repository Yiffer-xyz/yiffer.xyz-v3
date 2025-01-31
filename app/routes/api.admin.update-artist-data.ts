import type { ArtistDataChanges } from './admin.artists.$artist/route';
import type { Artist } from '~/types/types';
import type { QueryWithParams } from '~/utils/database-facade';
import { queryDbMultiple } from '~/utils/database-facade';
import { isUsernameUrl } from '~/utils/general';
import { redirectIfNotMod } from '~/utils/loaders';
import type { ApiError, noGetRoute } from '~/utils/request-helpers';
import {
  create400Json,
  createSuccessJson,
  makeDbErr,
  processApiError,
  wrapApiError,
} from '~/utils/request-helpers';
import { getArtistByField } from '~/route-funcs/get-artist';
import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { addModLogAndPoints } from '~/route-funcs/add-mod-log-and-points';

export { noGetRoute as loader };

export async function action(args: ActionFunctionArgs) {
  const user = await redirectIfNotMod(args);

  const formData = await args.request.formData();
  const body = JSON.parse(formData.get('body') as string) as ArtistDataChanges;

  if (body.e621Name && isUsernameUrl(body.e621Name)) {
    return create400Json('e621Name cannot be a URL');
  }
  if (body.patreonName && isUsernameUrl(body.patreonName)) {
    return create400Json('patreonName cannot be a URL');
  }

  const err = await updateArtistData(args.context.cloudflare.env.DB, body);
  if (err) {
    return processApiError('Errir in /update-artist-data', err);
  }

  const modLogErr = await addModLogAndPoints({
    db: args.context.cloudflare.env.DB,
    userId: user.userId,
    artistId: body.artistId,
    actionType: 'artist-updated',
  });
  if (modLogErr) {
    return processApiError('Error in /update-artist-data', modLogErr);
  }

  return createSuccessJson();
}

export async function updateArtistData(
  db: D1Database,
  changes: ArtistDataChanges
): Promise<ApiError | undefined> {
  const dbUpdateStatements: QueryWithParams[] = [];

  if (
    changes.name ||
    changes.e621Name !== undefined ||
    changes.patreonName !== undefined
  ) {
    dbUpdateStatements.push(getUpdateGeneralDetailsQuery(changes));
  }

  if (changes.links) {
    const artistRes = await getArtistByField(db, 'id', changes.artistId);
    if (artistRes.err) {
      return wrapApiError(artistRes.err, 'Error updating artist', changes);
    }
    if (artistRes.notFound) {
      return { logMessage: 'Artist not found', context: { artistId: changes.artistId } };
    }

    dbUpdateStatements.push(
      ...getUpdateLinksQuery(changes.artistId, changes.links, artistRes.result)
    );
  }

  const dbRes = await queryDbMultiple(db, dbUpdateStatements);
  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error updating details+links in updateArtistData', changes);
  }
}

function getUpdateLinksQuery(
  artistId: number,
  links: string[],
  existingArtist: Artist
): QueryWithParams[] {
  const newLinks = links.filter(l => !existingArtist.links.includes(l));
  const deletedLinks = existingArtist.links.filter(l => !links.includes(l));
  const dbStatements: QueryWithParams[] = [];

  if (newLinks.length > 0) {
    const addLinksQuery = `INSERT INTO artistlink (artistId, linkUrl) VALUES ${newLinks
      .map(() => '(?, ?)')
      .join(', ')}`;
    dbStatements.push({
      query: addLinksQuery,
      params: newLinks.flatMap(l => [artistId, l]),
    });
  }

  if (deletedLinks.length > 0) {
    const deleteLinksQuery = `DELETE FROM artistlink WHERE artistId = ? AND linkUrl IN (${deletedLinks
      .map(() => '?')
      .join(', ')})`;
    dbStatements.push({
      query: deleteLinksQuery,
      params: [artistId, ...deletedLinks],
    });
  }

  return dbStatements;
}

function getUpdateGeneralDetailsQuery(changes: ArtistDataChanges): QueryWithParams {
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

  return {
    query: `UPDATE artist SET ${updateFieldStr} WHERE id = ?`,
    params: updateFieldValues,
  };
}
