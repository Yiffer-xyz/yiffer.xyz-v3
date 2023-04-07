import { TypedResponse } from '@remix-run/cloudflare';
import { addContributionPoints } from '~/routes/api/funcs/add-contribution-points';
import { UserSession } from '~/types/types';
import { DBResponse, queryDb, queryDbDirect } from '~/utils/database-facade';
import { ApiError, wrapApiError } from '~/utils/request-helpers';
import { NewArtist, UploadBody } from '.';

export async function processUpload(
  urlBase: string,
  uploadBody: UploadBody,
  user: UserSession | null,
  userIP?: string
): Promise<ApiError | undefined> {
  const skipApproval = !!user && ['moderator', 'admin'].includes(user?.userType);

  if (uploadBody.newArtist) {
    const { artistId, err } = await createArtist(
      urlBase,
      uploadBody.newArtist,
      skipApproval
    );
    if (err) {
      return err;
    }
    uploadBody.artistId = artistId;
  }

  let { err, comicId } = await createComic(urlBase, uploadBody, skipApproval);
  if (err) return err;

  err = await createComicMetadata(
    urlBase,
    comicId,
    uploadBody,
    skipApproval,
    user?.userId,
    userIP
  );
  if (err) return err;

  if (uploadBody.previousComic || uploadBody.nextComic) {
    const err = await createComicLinks(urlBase, uploadBody, comicId);
    if (err) return err;
  }

  if (uploadBody.tagIds) {
    const err = await createComicTags(urlBase, uploadBody.tagIds, comicId);
    if (err) return err;
  }
}

async function createComicTags(
  urlBase: string,
  tagIds: number[],
  comicId: number
): Promise<ApiError | undefined> {
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

  const dbRes = await queryDb(urlBase, query, params);
  if (dbRes.errorMessage) {
    return {
      error: dbRes,
      logMessage: `Error creating comic tags. Tag ids: ${JSON.stringify(
        tagIds
      )}. Comic id: ${comicId}`,
      clientMessage: 'Error adding tags to comic',
    };
  }
}

async function createComicLinks(
  urlBase: string,
  uploadBody: UploadBody,
  comicId: number
): Promise<ApiError | undefined> {
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

  const dbRes = await queryDb(urlBase, query, queryParams);
  if (dbRes.errorMessage) {
    return {
      error: dbRes,
      logMessage: `Error creating comic links. Upload body: ${JSON.stringify(
        uploadBody
      )}`,
      clientMessage: 'Error creating prev/next comic',
    };
  }
}

async function createComicMetadata(
  urlBase: string,
  comicId: number,
  uploadBody: UploadBody,
  skipApproval: boolean,
  userId?: number,
  userIP?: string
): Promise<ApiError | undefined> {
  const query = `
    INSERT INTO comicmetadata
    (comicId, uploadUserId, uploadUserIP, uploadId, verdict)
    VALUES (?, ?, ?, ?, ?)
  `;

  const values = [
    comicId,
    userId || null,
    userIP || null,
    uploadBody.uploadId,
    skipApproval ? 'excellent' : null,
  ];

  const dbRes = await queryDb(urlBase, query, values);
  if (dbRes.errorMessage) {
    return {
      error: dbRes,
      logMessage: `Error creating comic metadata. Upload body: ${JSON.stringify(
        uploadBody
      )}`,
      clientMessage: 'Error creating comic metadata',
    };
  }

  if (skipApproval) {
    const err = await addContributionPoints(urlBase, userId!, `comicUploadexcellent`);
    if (err) {
      return wrapApiError(err, 'Error adding contribution points for direct mod upload');
    }
  }
}

async function createComic(
  urlBase: string,
  uploadBody: UploadBody,
  skipApproval: boolean
): Promise<{ comicId: number; err?: ApiError }> {
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
    skipApproval ? 'pending' : 'uploaded',
  ];

  const result = await queryDb(urlBase, query, values);
  if (result.errorMessage) {
    return {
      comicId: -1,
      err: {
        error: result,
        logMessage: `Error creating comic. Upload body: ${JSON.stringify(uploadBody)}`,
        clientMessage: 'Error creating comic',
      },
    };
  }
  if (!result.insertId) {
    return {
      comicId: -1,
      err: {
        error: result,
        logMessage: `Error creating comic, no insert result. Body: ${JSON.stringify(
          uploadBody
        )}`,
        clientMessage: 'Error creating comic',
      },
    };
  }
  return { comicId: result.insertId };
}

async function createArtist(
  urlBase: string,
  newArtist: NewArtist,
  skipApproval: boolean
): Promise<{ artistId: number; err?: ApiError | undefined }> {
  const insertQuery = `
    INSERT INTO artist (name, e621name, patreonName, isPending)
    VALUES (?, ?, ?, ?)
  `;
  const insertValues = [
    newArtist.artistName,
    newArtist.e621Name || null,
    newArtist.patreonName || null,
    skipApproval ? 0 : 1,
  ];
  let dbRes = await queryDb(urlBase, insertQuery, insertValues);
  const artistId = dbRes.insertId;

  if (dbRes.errorMessage || !artistId) {
    dbRes.errorMessage = dbRes.errorMessage || 'Could not create artist';
    return {
      artistId: -1,
      err: {
        logMessage: `Error inserting artist into database. Artist: ${JSON.stringify(
          newArtist
        )}`,
        clientMessage: 'Error creating artist',
        error: dbRes,
      },
    };
  }

  if (newArtist.links && newArtist.links.length > 0) {
    const err = await createArtistLinks(urlBase, newArtist, artistId);
    if (err) {
      return { artistId: -1, err: wrapApiError(err, 'Error creating artist links') };
    }
  }

  return { artistId };
}

async function createArtistLinks(
  urlBase: string,
  newArtist: NewArtist,
  newArtistId: number
): Promise<ApiError | undefined> {
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

  const dbRes = await queryDb(urlBase, linkInsertQuery, linkInsertValues);
  if (dbRes.errorMessage) {
    return {
      error: dbRes,
      logMessage: `Error creating artist links. New artist ID: ${newArtistId}. Artist ${JSON.stringify(
        newArtist
      )}.`,
      clientMessage: 'Error creating artist links',
    };
  }
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
