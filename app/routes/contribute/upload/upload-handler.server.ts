import { queryDb } from '~/utils/database-facade';
import { NewArtist, UploadBody } from '.';

// TODO: error handling, waiting for master to avoid clashes..
export async function processUpload(
  urlBase: string,
  uploadBody: UploadBody,
  userId?: number,
  userIP?: string
) {
  if (uploadBody.newArtist) {
    uploadBody.artistId = await createPendingArtist(urlBase, uploadBody.newArtist);
  }

  const comicId = await createComic(urlBase, uploadBody);

  await createUnpublishedComicData(urlBase, comicId, uploadBody, userId, userIP);

  if (uploadBody.previousComic || uploadBody.nextComic) {
    await createComicLinks(urlBase, uploadBody, comicId);
  }

  if (uploadBody.tagIds) {
    await createComicTags(urlBase, uploadBody.tagIds, comicId);
  }
}

async function createComicTags(urlBase: string, tagIds: number[], comicId: number) {
  let query = `
    INSERT INTO comickeyword
    (comicId, keywordId)
    VALUES 
  `;
  const params: number[] = [];

  tagIds.forEach((tagId, index) => {
    query += `(?, ?)`;
    params.push(comicId, tagId);
    if (index < tagIds.length - 1) {
      query += ', ';
    }
  });

  const result = await queryDb(urlBase, query, params);
  if (result.errorMessage) {
    throw new Error(result.errorMessage); // TODO: error handling
  }
}

async function createComicLinks(
  urlBase: string,
  uploadBody: UploadBody,
  comicId: number
) {
  let query = `
    INSERT INTO comiclink
    (firstComic, lastComic)
    VALUES (?, ?)
  `;
  let queryParams: any[] = [];

  if (uploadBody.previousComic) {
    queryParams.push(uploadBody.previousComic.id, comicId);
  }
  if (uploadBody.nextComic) {
    queryParams.push(comicId, uploadBody.nextComic.id);
  }
  if (uploadBody.previousComic && uploadBody.nextComic) {
    query += ', (?, ?)';
  }

  await queryDb(urlBase, query, queryParams);
}

async function createUnpublishedComicData(
  urlBase: string,
  comicId: number,
  uploadBody: UploadBody,
  userId?: number,
  userIP?: string
) {
  const query = `
    INSERT INTO unpublishedcomic
    (comicId, uploadUserId, uploadUserIP, uploadId)
    VALUES (?, ?, ?, ?)
  `;

  const values = [comicId, userId || null, userIP || null, uploadBody.uploadId];

  await queryDb(urlBase, query, values);
}

async function createComic(urlBase: string, uploadBody: UploadBody): Promise<number> {
  const query = `
    INSERT INTO comic
    (name, cat, tag, state, numberOfPages, artist, publishStatus)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    uploadBody.comicName,
    uploadBody.classification,
    uploadBody.category,
    uploadBody.state,
    uploadBody.numberOfPages,
    uploadBody.artistId,
    'uploaded',
  ];

  const result = await queryDb(urlBase, query, values);
  if (result.errorMessage) {
    throw new Error(
      'Error creating comic: Error inserting comic: ' + result.errorMessage
    );
  }
  if (!result.insertId) {
    throw new Error('Error creating comic: No insertId');
  }
  return result.insertId; // TODO when error handling is ready
}

async function createPendingArtist(
  urlBase: string,
  newArtist: NewArtist
): Promise<number> {
  const insertQuery = `
    INSERT INTO artist (name, e621name, patreonName, isPending)
    VALUES (?, ?, ?, ?)
  `;
  const insertValues = [
    newArtist.artistName,
    newArtist.e621Name || null,
    newArtist.patreonName || null,
    true,
  ];
  const insertResult = await queryDb(urlBase, insertQuery, insertValues);
  const artistId = insertResult.insertId;

  if (insertResult.errorMessage || !artistId) {
    throw new Error('Error creating pending artist');
  }

  if (newArtist.links) {
    await createArtistLinks(urlBase, newArtist, artistId);
  }

  return artistId;
}

async function createArtistLinks(
  urlBase: string,
  newArtist: NewArtist,
  newArtistId: number
) {
  let filteredLinks = newArtist.links.filter(link => link.length > 0);
  let linkInsertQuery = `INSERT INTO artistlink (ArtistId, LinkUrl) VALUES `;
  const linkInsertValues = [];

  for (let i = 0; i < filteredLinks.length; i++) {
    linkInsertQuery += `(?, ?)`;
    linkInsertValues.push(newArtistId, filteredLinks[i]);
    if (i < newArtist.links.length - 1) {
      linkInsertQuery += ', ';
    }
  }

  await queryDb(urlBase, linkInsertQuery, linkInsertValues);
}

const linkWebsites = [
  'twitter',
  'patreon',
  'e621',
  'furaffinity',
  'deviantart',
  'tumblr',
  'pixiv',
];

type LinkWithType = {
  linkUrl: string;
  linkType: string;
};

function extractLinkTypeFromLinkUrl(link: string): LinkWithType {
  let linkType = 'website';
  let linkUrl = link.trim();
  if (linkUrl.endsWith('/')) {
    linkUrl = linkUrl.slice(0, -1);
  }
  if (!linkUrl.startsWith('http://') && !linkUrl.startsWith('https://')) {
    linkUrl = 'https://' + linkUrl;
  }

  linkWebsites.forEach(linkTypeCandidate => {
    if (link.includes(linkTypeCandidate)) {
      linkType = linkTypeCandidate;
    }
  });

  return { linkUrl, linkType };
}
