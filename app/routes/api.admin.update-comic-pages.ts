import type { QueryWithParams } from '~/utils/database-facade';
import { queryDb, queryDbExec, queryDbMultiple } from '~/utils/database-facade';
import { redirectIfNotMod } from '~/utils/loaders';
import type { ApiError, noGetRoute } from '~/utils/request-helpers';
import {
  createSuccessJson,
  makeDbErr,
  processApiError,
  wrapApiError,
} from '~/utils/request-helpers';
import { getComicByField } from '~/route-funcs/get-comic';
import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { recalculateComicsPaginated } from '~/route-funcs/get-and-cache-comicspaginated';
import { addModLogAndPoints } from '~/route-funcs/add-mod-log-and-points';
import { capitalizeString } from '~/utils/general';
import { batchRenameR2Files, deleteR2File } from '~/utils/r2Utils';
import {
  R2_COMICS_FOLDER,
  R2_TEMP_FOLDER,
  RESTRICT_NOTIFICATIONS_TO_PATRONS,
} from '~/types/constants';
import { generateToken } from '~/utils/string-utils';

export { noGetRoute as loader };

export type ComicPageChangesBody = {
  comicId: number;
  deletedPageTokens: string[];
  changedPages: { token: string; pageNumber: number }[];
  newPagesWithTempTokens: { pageNumber: number; tempToken: string }[];
  newNumberOfPages: number;
  shouldUpdateLastUpdatedTimestamp: boolean;
};

export async function action(args: ActionFunctionArgs) {
  const user = await redirectIfNotMod(args);

  const formData = await args.request.formData();
  const body = JSON.parse(formData.get('body') as string) as ComicPageChangesBody;

  const err = await updateComicPages(
    args.context.cloudflare.env.DB,
    args.context.cloudflare.env.COMICS_BUCKET,
    args.context.cloudflare.env.IS_LOCAL_DEV === 'true',
    args.context.cloudflare.env.IMAGES_SERVER_URL,
    body,
    user.userId
  );
  if (err) {
    return processApiError(`Error in /update-comic-pages`, err, body);
  }

  if (body.shouldUpdateLastUpdatedTimestamp) {
    const err = await handleUpdatedComicBookmarkNotifications(
      args.context.cloudflare.env.DB,
      body.comicId
    );
    if (err) {
      return processApiError(
        `Error in /update-comic-pages, sending notifications`,
        err,
        body
      );
    }
  }

  return createSuccessJson();
}

export async function updateComicPages(
  db: D1Database,
  r2: R2Bucket,
  isLocalDev: boolean,
  imagesServerUrl: string,
  changes: ComicPageChangesBody,
  userId: number
): Promise<ApiError | undefined> {
  const comicRes = await getComicByField({
    db,
    fieldName: 'id',
    fieldValue: changes.comicId,
  });

  if (comicRes.err) {
    return wrapApiError(comicRes.err, `Could not update comic pages`, changes);
  }
  if (comicRes.notFound) {
    return {
      logMessage: `Could not update comic pages - comic not found`,
      context: changes,
    };
  }

  const dbStatements: QueryWithParams[] = [];

  for (const deletedPageToken of changes.deletedPageTokens) {
    await deleteR2File({
      r2,
      key: `${R2_COMICS_FOLDER}/${changes.comicId}/${deletedPageToken}.jpg`,
      isLocalDev,
      imagesServerUrl,
    });

    dbStatements.push({
      query: `DELETE FROM comicpage WHERE token = ?`,
      params: [deletedPageToken],
    });
  }

  for (const changedPage of changes.changedPages) {
    dbStatements.push({
      query: `UPDATE comicpage SET pageNumber = ? WHERE token = ?`,
      params: [changedPage.pageNumber, changedPage.token],
    });
  }

  const oldKeys: string[] = [];
  const newKeys: string[] = [];

  for (const newPage of changes.newPagesWithTempTokens) {
    const newToken = generateToken();

    oldKeys.push(`${R2_TEMP_FOLDER}/${newPage.tempToken}.jpg`);
    newKeys.push(`${R2_COMICS_FOLDER}/${changes.comicId}/${newToken}.jpg`);

    dbStatements.push({
      query: `INSERT INTO comicpage (token, comicId, pageNumber) VALUES (?, ?, ?)`,
      params: [newToken, changes.comicId, newPage.pageNumber],
    });
  }

  await batchRenameR2Files({
    r2,
    oldKeys,
    newKeys,
    isLocalDev,
    imagesServerUrl,
  });

  dbStatements.push({
    query: 'UPDATE comic SET numberOfPages = ? WHERE id = ?',
    params: [changes.newNumberOfPages, changes.comicId],
  });

  const dbRes = await queryDbMultiple(db, dbStatements);
  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error updating comic pages', changes);
  }

  // Add mod log and points
  if (dbStatements.length > 0) {
    const texts: string[] = [];
    if (changes.newPagesWithTempTokens.length > 0)
      texts.push(`added ${changes.newPagesWithTempTokens.length} pages`);
    if (changes.deletedPageTokens.length > 0)
      texts.push(`deleted ${changes.deletedPageTokens.length} pages`);
    if (changes.changedPages.length > 0) texts.push('rearranged pages');
    const modLogErr = await addModLogAndPoints({
      db,
      userId,
      comicId: changes.comicId,
      actionType: 'comic-pages-changed',
      text: capitalizeString(texts.join(', ')),
    });
    if (modLogErr) {
      return wrapApiError(modLogErr, 'Error in /update-comic-pages', changes);
    }
  }

  const recalcRes = await recalculateComicsPaginated(db);
  if (recalcRes) return wrapApiError(recalcRes, 'Error in updateComicPages', changes);
}

async function handleUpdatedComicBookmarkNotifications(
  db: D1Database,
  comicId: number
): Promise<ApiError | undefined> {
  const bookmarkedQuery = `SELECT userId FROM comicbookmark WHERE comicId = ?`;
  const bookmarkedRes = await queryDb<{ userId: number }[]>(db, bookmarkedQuery, [
    comicId,
  ]);

  if (bookmarkedRes.isError) {
    return makeDbErr(bookmarkedRes, 'Error getting bookmarked users for comic');
  }

  let subscribedUserIds = bookmarkedRes.result.map(r => r.userId);

  if (RESTRICT_NOTIFICATIONS_TO_PATRONS) {
    const eligibleUserIds = await queryDb<{ id: number }[]>(
      db,
      `SELECT id FROM user 
       WHERE (patreonDollars > 10 OR userType = 'moderator' OR userType = 'admin')
       AND id IN (${subscribedUserIds.map(() => '?').join(',')})`,
      subscribedUserIds
    );

    if (eligibleUserIds.isError) {
      return makeDbErr(eligibleUserIds, 'Error getting patron users');
    }

    subscribedUserIds = subscribedUserIds.filter(userId =>
      eligibleUserIds.result.some(p => p.id === userId)
    );
  }

  console.log('subscribedUserIds', subscribedUserIds);
  if (subscribedUserIds.length === 0) {
    return;
  }

  // Delete existing notifications (to replace with new ones), but only for users
  // still subscribed - otherwise we won't be replacing it.
  const deleteNotifsQuery = `DELETE FROM comicupdatenotification
    WHERE comicId = ?
    AND userId IN (SELECT userId FROM comicbookmark WHERE comicId = ?)`;

  const deleteRes = await queryDbExec(db, deleteNotifsQuery, [comicId, comicId]);
  if (deleteRes.isError) {
    return makeDbErr(bookmarkedRes, 'Error deleting existing comic notifications');
  }

  let insertNotificationQuery = `INSERT INTO comicupdatenotification (userId, comicId) VALUES `;
  const insertNotificationParams: number[] = [];

  subscribedUserIds.forEach((userId, index) => {
    insertNotificationQuery += '(?, ?)';
    insertNotificationParams.push(userId, comicId);
    if (index < subscribedUserIds.length - 1) {
      insertNotificationQuery += ', ';
    }
  });

  const insertRes = await queryDbExec(
    db,
    insertNotificationQuery,
    insertNotificationParams
  );
  if (insertRes.isError) {
    return makeDbErr(insertRes, 'Error inserting new comic notifications');
  }

  return;
}
