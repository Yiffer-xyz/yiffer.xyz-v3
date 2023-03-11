import { queryDbDirect } from '~/utils/database-facade';

type ComicInQueue = {
  publishingQueuePos: number;
  comicId: number;
};

export async function moveComicInQueue(urlBase: string, comicId: number, moveBy: 1 | -1) {
  const getPosQuery = 'SELECT publishingQueuePos FROM unpublishedcomic WHERE comicId = ?';
  const result = await queryDbDirect<{ publishingQueuePos: number }[]>(
    urlBase,
    getPosQuery,
    [comicId]
  );
  const oldPos = result[0].publishingQueuePos;

  const moveComicQuery =
    'UPDATE unpublishedcomic SET publishingQueuePos = ? WHERE comicId = ?';
  const moveComicQueryParams = [oldPos + moveBy, comicId];

  const moveOtherComicQuery =
    'UPDATE unpublishedcomic SET publishingQueuePos = ? WHERE publishingQueuePos = ?';
  const moveOtherComicQueryParams = [oldPos, oldPos + moveBy];

  await queryDbDirect(urlBase, moveOtherComicQuery, moveOtherComicQueryParams);
  await queryDbDirect(urlBase, moveComicQuery, moveComicQueryParams);
}

export async function recalculatePublishingQueue(urlBase: string) {
  const query = `
    SELECT publishingQueuePos, comicId
    FROM unpublishedcomic INNER JOIN comic ON (comic.id = unpublishedcomic.comicId)
    WHERE
      publishStatus = 'scheduled'
      AND publishDate IS NULL
    ORDER BY publishingQueuePos ASC
  `;

  const comicsInQueue = await queryDbDirect<ComicInQueue[]>(urlBase, query);

  const comicsWithPos = comicsInQueue.filter(comic => comic.publishingQueuePos !== null);
  const comicsWithoutPos = comicsInQueue.filter(
    comic => comic.publishingQueuePos === null
  );

  const newQueue = comicsWithPos
    .sort((a, b) => a.publishingQueuePos - b.publishingQueuePos)
    .map((comic, index) => {
      return {
        ...comic,
        publishingQueuePos: index + 1,
      };
    })
    .concat(
      comicsWithoutPos.map((comic, index) => {
        return {
          ...comic,
          publishingQueuePos: comicsWithPos.length + index + 1,
        };
      })
    );

  console.log('new queue', newQueue);

  // only update comics whose position changed
  const comicsToUpdate = [];
  for (const comic of comicsInQueue) {
    const newQueuePos = newQueue.find(
      newComic => newComic.comicId === comic.comicId
    )?.publishingQueuePos;
    if (newQueuePos !== comic.publishingQueuePos) {
      comicsToUpdate.push({
        comicId: comic.comicId,
        newQueuePos,
      });
    }
  }

  const updateQuery = `
    UPDATE unpublishedcomic
    SET publishingQueuePos = ?
    WHERE comicId = ?
  `;

  const updatePromises = comicsToUpdate.map(comic =>
    queryDbDirect(urlBase, updateQuery, [comic.newQueuePos, comic.comicId])
  );

  await Promise.all(updatePromises);
}
