import { COMICS_PER_PAGE } from '~/types/constants';
import type { ApiError, ResultOrErrorPromise } from '~/utils/request-helpers';
import { makeDbErr, wrapApiError } from '~/utils/request-helpers';
import type { ComicsPaginatedResult } from './get-comics-paginated';
import { getComicsPaginated } from './get-comics-paginated';
import { isComic } from '~/utils/general';
import { queryDbExec } from '~/utils/database-facade';

type Args = {
  db: D1Database;
  pageNum: number;
  includeAds: boolean;
};

export async function recalculateComicsPaginated(
  db: D1Database
): Promise<ApiError | undefined> {
  const promises = [
    getAndCacheComicsPaginated({
      db,
      pageNum: 1,
      includeAds: false,
    }),
    getAndCacheComicsPaginated({
      db,
      pageNum: 2,
      includeAds: false,
    }),
    getAndCacheComicsPaginated({
      db,
      pageNum: 3,
      includeAds: false,
    }),
  ];

  const [res1, res2, res3] = await Promise.all(promises);

  if (res1.err) {
    return wrapApiError(res1.err, 'Error in recalculateComicsPaginated p1');
  }
  if (res2.err) {
    return wrapApiError(res2.err, 'Error in recalculateComicsPaginated p2');
  }
  if (res3.err) {
    return wrapApiError(res3.err, 'Error in recalculateComicsPaginated p3');
  }
}

export async function getAndCacheComicsPaginated({
  db,
  pageNum,
  includeAds = false,
}: Args): ResultOrErrorPromise<ComicsPaginatedResult> {
  const comicsRes = await getComicsPaginated({
    db,
    limit: COMICS_PER_PAGE,
    offset: pageNum !== 1 ? (pageNum - 1) * COMICS_PER_PAGE : undefined,
    order: 'updated',
    includeTags: true,
    includeAds,
  });

  if (comicsRes.err) {
    return { err: wrapApiError(comicsRes.err, 'Error in getAndCacheComicsPaginated') };
  }

  const comicsWithoutAds = comicsRes.result.comicsAndAds.filter(comic => isComic(comic));
  const resultsWithoutAds: ComicsPaginatedResult = {
    ...comicsRes.result,
    comicsAndAds: comicsWithoutAds,
  };
  const jsonResultsWithoutAds = JSON.stringify(resultsWithoutAds);

  const upsertQuery = `
    INSERT INTO comicspaginatedcache (comicsJson, page) VALUES (?, ?)
    ON CONFLICT (page) DO UPDATE SET comicsJson = ?
  `;
  const insertValues = [jsonResultsWithoutAds, pageNum, jsonResultsWithoutAds];

  const execResponse = await queryDbExec(
    db,
    upsertQuery,
    insertValues,
    'Write comics paginated cache'
  );

  if (execResponse.isError) {
    return {
      err: makeDbErr(execResponse, 'Error writing in getAndCacheComicsPaginated'),
    };
  }

  return { result: comicsRes.result };
}
