import type { PendingComic } from '~/types/types';
import { queryDb } from '~/utils/database-facade';
import type { ResultOrErrorPromise } from '~/utils/request-helpers';
import { makeDbErrObj } from '~/utils/request-helpers';

type DbPendingComic = Omit<PendingComic, 'timestamp' | 'publishDate'> & {
  timestamp: string;
  publishDate: string;
};

export async function getPendingComics(
  db: D1Database,
  scheduledOnly?: boolean,
  topAmount?: number
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
    ORDER BY timestamp ASC
    ${topAmount ? `LIMIT ${topAmount}` : ''}
  `;

  const dbRes = await queryDb<DbPendingComic[]>(db, pendingComicsQuery);

  if (dbRes.isError) {
    return makeDbErrObj(dbRes, 'Error getting pending comics', {
      scheduledOnly,
      topAmount,
    });
  }

  const comics = dbRes.result.map(comic => ({
    ...comic,
    timestamp: new Date(comic.timestamp),
    publishDate: comic.publishDate ? new Date(comic.publishDate) : undefined,
  }));

  return { result: comics };
}
