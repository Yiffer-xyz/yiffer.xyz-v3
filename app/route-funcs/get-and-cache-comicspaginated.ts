import { COMICS_PER_PAGE } from '~/types/constants';
import type { ApiError, ResultOrErrorPromise } from '~/utils/request-helpers';
import { makeDbErr, wrapApiError } from '~/utils/request-helpers';
import type { ComicsPaginatedResult } from './get-comics-paginated';
import { getComicsPaginated } from './get-comics-paginated';
import { isComic } from '~/utils/general';
import type { ExecDBResponse } from '~/utils/database-facade';
import { queryDbExec } from '~/utils/database-facade';

type Args = {
  db: D1Database;
  includeTags: boolean;
  pageNum: number;
  includeAds: boolean;
};

export async function recalculateComicsPaginated(
  db: D1Database
): Promise<ApiError | undefined> {
  const res = await getAndCacheComicsPaginated({
    db,
    includeTags: true,
    pageNum: 1,
    includeAds: false,
  });
  if (res.err) return wrapApiError(res.err, 'Error in recalculateComicsPaginated');
}

export async function getAndCacheComicsPaginated({
  db,
  includeTags,
  pageNum,
  includeAds = false,
}: Args): ResultOrErrorPromise<ComicsPaginatedResult> {
  const comicsRes = await getComicsPaginated({
    db,
    limit: COMICS_PER_PAGE,
    offset: pageNum !== 1 ? (pageNum - 1) * COMICS_PER_PAGE : undefined,
    order: 'updated',
    includeTags,
    includeAds,
  });

  if (comicsRes.err) {
    return { err: wrapApiError(comicsRes.err, 'Error in getAndCacheComicsPaginated') };
  }

  const dbExecResponses: Promise<ExecDBResponse>[] = [];

  // always store the comics without tags. only store with tags if queried with includeTags = true
  const comicsWithoutAds = comicsRes.result.comicsAndAds.filter(comic => isComic(comic));

  const comicsWithoutTagsToStore = {
    ...comicsRes.result,
    comicsAndAds: comicsWithoutAds.map(comic => ({ ...comic, tags: undefined })),
  };
  const upsertQuery = `
    INSERT INTO comicspaginatedcache (comicsJson, includeTags, page) VALUES (?, ?, ?)
    ON CONFLICT (includeTags, page) DO UPDATE SET comicsJson = ?
  `;
  const insertValues = [
    JSON.stringify(comicsWithoutTagsToStore),
    false,
    pageNum,
    JSON.stringify(comicsWithoutTagsToStore),
  ];

  dbExecResponses.push(
    queryDbExec(
      db,
      upsertQuery,
      insertValues,
      'Write comics paginated cache',
      'includeTags: false'
    )
  );

  if (includeTags) {
    const comicsWithTagsToStore = {
      ...comicsRes.result,
      comicsAndAds: comicsWithoutAds,
    };
    const upsertQuery = `
      INSERT INTO comicspaginatedcache (comicsJson, includeTags, page) VALUES (?, ?, ?)
      ON CONFLICT (includeTags, page) DO UPDATE SET comicsJson = ?
    `;
    const insertValues = [
      JSON.stringify(comicsWithTagsToStore),
      true,
      pageNum,
      JSON.stringify(comicsWithTagsToStore),
    ];
    dbExecResponses.push(
      queryDbExec(
        db,
        upsertQuery,
        insertValues,
        'Write comics paginated cache',
        'includeTags: true'
      )
    );
  }

  const execResponses = await Promise.all(dbExecResponses);
  const err = execResponses.find(res => res.isError);
  if (err) {
    return { err: makeDbErr(err, 'Error writing in getAndCacheComicsPaginated') };
  }

  return { result: comicsRes.result };
}
