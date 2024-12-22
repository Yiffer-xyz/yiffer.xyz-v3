import type { PendingComic } from '~/types/types';
import { queryDb } from '~/utils/database-facade';
import { parseDbDateStr } from '~/utils/date-utils';
import type { ResultOrErrorPromise } from '~/utils/request-helpers';
import { makeDbErrObj } from '~/utils/request-helpers';

type DbPendingComic = Omit<PendingComic, 'timestamp' | 'publishDate'> & {
  timestamp: string;
  publishDate: string;
};

export async function getPendingComics(
  db: D1Database,
  scheduledOnly?: boolean,
  topAmount?: number,
  orderByPublishingQueuePos?: boolean
): ResultOrErrorPromise<PendingComic[]> {
  const pendingComicsQuery = `
    SELECT Q2.*, user.username AS scheduleModName FROM (
      SELECT Q1.*, user.username AS reviewerModName 
        FROM (
          SELECT
              comic.name AS comicName,
              comic.id AS comicId,
              comic.publishStatus,
              artist.name AS artistName,
              COUNT(*) AS numberOfTags,
              timestamp,
              errorText,
              pendingProblemModId,
              uploadUserId,
              uploadUserIP,
              publishDate,
              publishingQueuePos,
              user.username AS uploadUsername,
              modId AS reviewerModId,
              scheduleModId
            FROM comic
            INNER JOIN comicmetadata ON (comic.id = comicmetadata.comicId)
            INNER JOIN artist ON (artist.id = comic.artist)
            LEFT JOIN comickeyword ON (comic.id = comickeyword.comicId)
            LEFT JOIN user ON (user.id = uploadUserId)
            WHERE ${
              scheduledOnly ? '' : `publishStatus = 'pending' OR`
            } publishStatus = 'scheduled'
            GROUP BY comic.id, timestamp, errorText, uploadUserId, uploadUserIP, publishDate, modId, scheduleModId
        ) AS Q1
      LEFT JOIN user ON (Q1.reviewerModId = user.id)
      WHERE publishStatus = 'pending' OR publishStatus = 'scheduled' OR publishStatus = 'published'
    ) AS Q2
    LEFT JOIN user ON (Q2.scheduleModId = user.id)
    ORDER BY ${orderByPublishingQueuePos ? 'publishingQueuePos ASC' : 'timestamp ASC'}
    ${topAmount ? `LIMIT ${topAmount}` : ''}
  `;

  const dbRes = await queryDb<DbPendingComic[]>(
    db,
    pendingComicsQuery,
    null,
    'Pending comics'
  );

  if (dbRes.isError) {
    return makeDbErrObj(dbRes, 'Error getting pending comics', {
      scheduledOnly,
      topAmount,
    });
  }

  const comics = dbRes.result.map(comic => ({
    ...comic,
    timestamp: parseDbDateStr(comic.timestamp),
    publishDate: comic.publishDate ? parseDbDateStr(comic.publishDate) : undefined,
  }));

  return { result: comics };
}
