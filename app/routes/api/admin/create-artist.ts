import { ActionArgs, json } from '@remix-run/cloudflare';
import { NewArtistData } from '~/routes/admin/new-artist';
import { queryDb, queryDbDirect } from '~/utils/database-facade';
import { redirectIfNotMod } from '~/utils/loaders';
import {
  create500Json,
  createGeneric500Json,
  createSuccessJson,
} from '~/utils/request-helpers';

export async function action(args: ActionArgs) {
  const urlBase = args.context.DB_API_URL_BASE as string;
  await redirectIfNotMod(args);
  const formData = await args.request.formData();
  const body = JSON.parse(formData.get('body') as string) as NewArtistData;

  try {
    const artistId = await createArtist(urlBase, body);
    return json({ success: true, artistId: artistId });
  } catch (e) {
    return e instanceof Error ? create500Json(e.message) : createGeneric500Json();
  }
}

export async function createArtist(
  urlBase: string,
  artistData: NewArtistData
): Promise<number> {
  if (artistData.e621Name && isStringUrl(artistData.e621Name)) {
    throw new Error('e621 name should not be an url - name only, as instructed!');
  }
  if (artistData.patreonName && isStringUrl(artistData.patreonName)) {
    throw new Error('Patreon name should not be an url - name only, as instructed!');
  }

  const artistQuery = 'INSERT INTO artist (name, e621Name, patreonName) VALUES (?, ?, ?)';
  const linksQuery = `INSERT INTO artistlink (artistId, linkUrl) VALUES ${artistData.links
    .map(() => '(?, ?)')
    .join(', ')}`;

  const artistPromise = await queryDb(urlBase, artistQuery, [
    artistData.artistName,
    artistData.e621Name || null,
    artistData.patreonName || null,
  ]);

  const artistId = artistPromise.insertId;
  if (!artistId) {
    throw new Error('Could not create artist');
  }

  await queryDbDirect(urlBase, linksQuery, [
    ...artistData.links.flatMap(l => [artistId, l]),
  ]);

  return artistId;
}

function isStringUrl(someString: string) {
  if (someString.includes('http')) {
    return true;
  }
  if (someString.includes('www')) {
    return true;
  }
  if (someString.includes('.com')) {
    return true;
  }

  return false;
}
