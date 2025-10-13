import type { Route } from './+types/get-notifications';
import { NOTIFICATIONS_PAGINATION_SIZE } from '~/types/constants';
import type { ComicUpdateNotification } from '~/types/types';
import { queryDb } from '~/utils/database-facade';
import { parseDbDateStr } from '~/utils/date-utils';
import { redirectIfNotLoggedIn } from '~/utils/loaders';
import { createSuccessJson, makeDbErr, processApiError } from '~/utils/request-helpers';

type DbNotification = Omit<ComicUpdateNotification, 'isRead' | 'timestamp'> & {
  isRead: 0 | 1;
  timestamp: string;
};

export async function loader(args: Route.LoaderArgs) {
  const user = await redirectIfNotLoggedIn(args);

  const url = new URL(args.request.url);
  const page = Number(url.searchParams.get('page')) || 1;

  const query = `SELECT
      comicupdatenotification.id AS id,
      comicId,
      isRead,
      comicupdatenotification.timestamp AS timestamp,
      comic.name AS comicName
    FROM comicupdatenotification
    INNER JOIN comic ON (comicupdatenotification.comicId = comic.id)
    WHERE userId = ?
    ORDER BY id DESC
    LIMIT ? OFFSET ?`;

  const dbRes = await queryDb<DbNotification[]>(
    args.context.cloudflare.env.DB,
    query,
    [
      user.userId,
      NOTIFICATIONS_PAGINATION_SIZE + 1,
      (page - 1) * NOTIFICATIONS_PAGINATION_SIZE,
    ],
    'Get notifications'
  );

  if (dbRes.isError) {
    return processApiError('Error in /api/get-notifications', makeDbErr(dbRes), {
      userId: user.userId,
    });
  }

  const mappedNotifications = dbRes.result.map(dbRow => ({
    ...dbRow,
    timestamp: parseDbDateStr(dbRow.timestamp),
    isRead: dbRow.isRead === 1,
  }));

  return createSuccessJson({
    notifications: mappedNotifications.slice(0, NOTIFICATIONS_PAGINATION_SIZE),
    hasNextPage: mappedNotifications.length > NOTIFICATIONS_PAGINATION_SIZE,
  });
}
