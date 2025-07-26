import type { ApiError } from '~/utils/request-helpers';
import { makeDbErr } from '~/utils/request-helpers';
import { queryDbExec } from '~/utils/database-facade';

export async function markSingleNotificationRead(
  db: D1Database,
  userId: number,
  notificationId: number
): Promise<ApiError | undefined> {
  const logCtx = { notificationId };

  const query = `
    UPDATE comicupdatenotification
    SET isRead = 1
    WHERE id = ?
    AND userId = ?
  `;

  const queryParams = [notificationId, userId];
  const dbRes = await queryDbExec(db, query, queryParams);

  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error marking notification as read', logCtx);
  }
}

export async function markSingleNotificationReadByComicId(
  db: D1Database,
  userId: number,
  comicId: number
): Promise<ApiError | undefined> {
  const logCtx = { comicId };

  const query = `
    UPDATE comicupdatenotification
    SET isRead = 1
    WHERE userId = ?
    AND comicId = ?
  `;

  const queryParams = [userId, comicId];
  const dbRes = await queryDbExec(db, query, queryParams);

  if (dbRes.isError) {
    return makeDbErr(dbRes, 'Error marking notification as read', logCtx);
  }

  return undefined;
}
