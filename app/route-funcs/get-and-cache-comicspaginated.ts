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
  const res = await getAndCacheComicsPaginated({
    db,
    pageNum: 1,
    includeAds: false,
  });
  if (res.err) return wrapApiError(res.err, 'Error in recalculateComicsPaginated');
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
