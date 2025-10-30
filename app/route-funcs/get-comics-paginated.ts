import { ADS_PER_PAGE, COMICS_PER_PAGE } from '~/types/constants';
import type { AdForViewing, ComicForBrowse } from '~/types/types';
import { queryDbMultiple } from '~/utils/database-facade';
import { parseDbDateStr } from '~/utils/date-utils';
import type { ResultOrErrorPromise } from '~/utils/request-helpers';
import { makeDbErrObj } from '~/utils/request-helpers';

type DbCardAdForViewing = Omit<AdForViewing, 'isAnimated'> & {
  isAnimated: 0 | 1;
};

type ComicForBrowseDB = Omit<
  ComicForBrowse,
  'tags' | 'avgStarsPercent' | 'updated' | 'published' | 'isBookmarked'
> & {
  tags?: string;
  avgStars: number;
  updated: string;
  published: string;
  isBookmarked: 0 | 1;
};

type GetComicsParams = {
  db: D1Database;
  userId?: number;
  limit?: number;
  offset?: number;
  categories?: string[];
  tagIDs?: number[];
  search?: string;
  order?: 'updated' | 'userRating' | 'yourRating' | 'random';
  artistId?: number;
  artistName?: string;
  includeTags?: boolean;
  includeAds?: boolean;
  bookmarkedOnly?: boolean;
};

export type ComicsPaginatedResult = {
  comicsAndAds: (ComicForBrowse | AdForViewing)[];
  numberOfPages: number;
  totalNumComics: number;
  page: number;
};

export async function getComicsPaginated({
  db,
  userId,
  limit,
  offset,
  categories,
  tagIDs,
  search,
  order,
  artistId,
  includeTags,
  includeAds,
  bookmarkedOnly,
}: GetComicsParams): ResultOrErrorPromise<ComicsPaginatedResult> {
  search = search?.trim();

  const logCtx = {
    userId,
    limit,
    offset,
    categories,
    tagIDs,
    search,
    order,
    artistId,
  };

  const queryExtraInfos: string[] = [];
  if (includeTags) queryExtraInfos.push(`includeTags`);
  if (userId) queryExtraInfos.push(`userId`);
  if (tagIDs && tagIDs.length > 0) queryExtraInfos.push(`tagIDs`);
  if (categories) queryExtraInfos.push(`categories`);
  if (search) queryExtraInfos.push(`search`);
  if (artistId) queryExtraInfos.push(`artistId`);
  if (bookmarkedOnly) queryExtraInfos.push(`bookmarkedOnly`);
  if (offset) queryExtraInfos.push(`offset-${offset}`);
  if (order !== 'updated') queryExtraInfos.push(`order-${order}`);
  const queryExtraInfo = queryExtraInfos.join(', ');

  const [
    filterQueryString,
    filterQueryParams,
    keywordCountString,
    innerJoinKeywordString,
  ] = getFilterQuery({ categories, keywordIds: tagIDs, search, artistId });

  const isBookmarkedQuery = `
    ${bookmarkedOnly ? 'INNER JOIN' : 'LEFT JOIN'} (
      SELECT comicId, 1 as isBookmarked
      FROM comicbookmark
      WHERE userId = ?
    ) AS isBookmarkedQuery ON (comic.id = isBookmarkedQuery.comicId)
  `;

  const { query, params: queryParams } = makeInnerQuery({
    order: order ?? 'updated',
    limit,
    offset,
    userId,
    categories,
    tagIDs,
    search,
    artistId,
    bookmarkedOnly,
    includeTags,
  });

  const isUnfilteredQuery =
    (!categories || categories.length === 0) &&
    (!tagIDs || tagIDs.length === 0) &&
    !search &&
    !artistId &&
    !bookmarkedOnly;

  const totalCountQuery = isUnfilteredQuery
    ? `SELECT COUNT(*) AS count FROM comic WHERE publishStatus = 'published'`
    : `SELECT COUNT(*) AS count FROM (
        SELECT comic.id
        FROM comic
        ${bookmarkedOnly ? isBookmarkedQuery : ''}
        ${innerJoinKeywordString}
        ${search ? ' INNER JOIN artist ON (artist.id = comic.artist) ' : ''}
        ${filterQueryString}
        GROUP BY comic.id
        ${keywordCountString}
      ) AS cc
    `;

  const totalCountQueryParams: any[] = [];

  if (bookmarkedOnly) totalCountQueryParams.push(userId);
  totalCountQueryParams.push(...filterQueryParams);

  const queries = [
    {
      query,
      params: queryParams,
      queryName: `Comics paginated`,
      extraInfo: queryExtraInfo,
    },
    {
      query: totalCountQuery,
      params: totalCountQueryParams,
      queryName: 'Comics paginated count',
    },
  ];

  if (includeAds) {
    const adsQueryAndParams = {
      query: `SELECT id, link, mainText, secondaryText, isAnimated, mediaType, videoSpecificFileType
        FROM advertisement
        WHERE adType = 'card' AND status = 'ACTIVE'
        ORDER BY RANDOM() LIMIT ${ADS_PER_PAGE} 
      `,
      params: [],
      queryName: 'Ads paginated',
    };
    queries.push(adsQueryAndParams);
  }

  const dbRes = await queryDbMultiple<
    | [ComicForBrowseDB[], { count: number }[]]
    | [ComicForBrowseDB[], { count: number }[], DbCardAdForViewing[]]
  >(db, queries);

  if (dbRes.isError) {
    return makeDbErrObj(dbRes, 'Error getting comics+count', logCtx);
  }

  const [comicsRaw, countDbRes] = dbRes.result;

  const comics: ComicForBrowse[] = comicsRaw.map(c => ({
    ...c,
    avgStarsPercent: comicRatingsToPercent(c.sumStars, c.numTimesStarred),
    tags: includeTags
      ? c.tags?.split(',').map(tag => {
          const [name, id] = tag.split('~');
          return { name, id: parseInt(id, 10) };
        })
      : undefined,
    published: parseDbDateStr(c.published),
    updated: parseDbDateStr(c.updated),
    isBookmarked: c.isBookmarked === 1,
  })) as ComicForBrowse[];

  let comicsWithAds: (ComicForBrowse | AdForViewing)[] = comics;
  if (includeAds && dbRes.result.length === 3 && dbRes.result[2].length > 0) {
    comicsWithAds = addAdsToComics(
      comics,
      dbRes.result[2].map(ad => ({
        ...ad,
        isAnimated: !!ad.isAnimated,
      }))
    );
  }

  return {
    result: {
      comicsAndAds: comicsWithAds,
      numberOfPages: Math.ceil(countDbRes[0].count / COMICS_PER_PAGE),
      totalNumComics: countDbRes[0].count,
      page: Math.ceil((offset ?? 0) / COMICS_PER_PAGE) + 1,
    },
  };
}

// Return the average as a % of 100, where 1 star = 0%, 2 stars = 50%, 3 stars = 100%
function comicRatingsToPercent(sumStars: number, numTimesStarred: number) {
  return Math.round((sumStars / numTimesStarred - 1) * 50);
}

export function addAdsToComics(
  comics: ComicForBrowse[],
  ads: AdForViewing[]
): (ComicForBrowse | AdForViewing)[] {
  const numComicsBetweenAds = Math.ceil(COMICS_PER_PAGE / ADS_PER_PAGE);
  const comicsWithAds: (ComicForBrowse | AdForViewing)[] = [];
  let adIndex = 0;

  const firstAdIndex = numComicsBetweenAds - 2;

  for (let i = 0; i < comics.length; i++) {
    if (
      i === firstAdIndex ||
      (i > firstAdIndex && (i - firstAdIndex) % numComicsBetweenAds === 0)
    ) {
      const ad: AdForViewing = {
        ...ads[adIndex % ads.length],
        renderId: ads[adIndex % ads.length].renderId + '-' + i,
      };
      comicsWithAds.push(ad);
      adIndex++;
    }
    comicsWithAds.push(comics[i]);
  }

  return comicsWithAds;
}

function getFilterQuery({
  categories,
  keywordIds,
  search,
  artistId,
}: {
  categories?: string[];
  keywordIds?: number[];
  search?: string;
  artistId?: number;
}) {
  let filterQueryString = `WHERE publishStatus = 'published'`;
  const filterQueryParams = [];
  let innerJoinKeywordString = '';
  let keywordCountString = '';

  if (categories || search || keywordIds || artistId) {
    const queries = [];
    if (keywordIds) {
      let keywordIdString = 'ckFilter.keywordId IN (';
      keywordIds.forEach(kwId => {
        filterQueryParams.push(kwId);
        keywordIdString += '?,';
      });
      keywordIdString = keywordIdString.slice(0, -1) + ')';

      keywordCountString = `HAVING COUNT(DISTINCT ckFilter.keywordId) >= ${keywordIds.length}`;
      queries.push(keywordIdString);
      innerJoinKeywordString =
        'INNER JOIN comickeyword AS ckFilter ON (comic.Id = ckFilter.comicId)';
    }

    if (categories) {
      const categoryStrings: string[] = [];
      categories.forEach(category => {
        filterQueryParams.push(category);
        categoryStrings.push(' category = ? ');
      });
      queries.push(`(${categoryStrings.join('OR')})`);
    }

    if (search) {
      queries.push('(comic.name LIKE ? OR artist.name LIKE ?)');
      filterQueryParams.push(`%${search}%`, `%${search}%`);
    }

    if (artistId) {
      queries.push('(comic.artist = ?)');
      filterQueryParams.push(artistId);
    }

    filterQueryString += ' AND ' + queries.join(' AND ');
  }

  return [
    filterQueryString,
    filterQueryParams,
    keywordCountString,
    innerJoinKeywordString,
  ];
}

type MakeInnerQueryArgs = {
  order: 'updated' | 'userRating' | 'yourRating' | 'random';
  limit?: number;
  offset?: number;
  userId?: number;
  categories?: string[];
  tagIDs?: number[];
  search?: string;
  artistId?: number;
  bookmarkedOnly?: boolean;
  includeTags?: boolean;
};

function makeInnerQuery({
  order,
  limit,
  offset,
  userId,
  categories,
  tagIDs,
  search,
  artistId,
  bookmarkedOnly,
  includeTags,
}: MakeInnerQueryArgs): { query: string; params: any[] } {
  const whereParts: string[] = [`c.publishStatus = 'published'`];
  const params: any[] = [];

  if (categories && categories.length) {
    whereParts.push(`c.category IN (${categories.map(() => '?').join(',')})`);
    params.push(...categories);
  }

  if (artistId) {
    whereParts.push(`c.artist = ?`);
    params.push(artistId);
  }

  if (search && search.trim()) {
    whereParts.push(`(c.name LIKE ? OR a.name LIKE ?)`);
    const like = `%${search.trim()}%`;
    params.push(like, like);
  }

  if (bookmarkedOnly && userId) {
    // bound to user, makes it cheap
    whereParts.push(
      `EXISTS (SELECT 1 FROM comicbookmark cb WHERE cb.userId = ? AND cb.comicId = c.id)`
    );
    params.push(userId);
  }

  // For tag filtering, we'll use a HAVING on top_ids (it's OK since we've already narrowed c)
  const needTagJoin = !!(tagIDs && tagIDs.length);

  if (needTagJoin && tagIDs!.length > 0) {
    whereParts.push(`ckf.keywordId IN (${tagIDs!.map(() => '?').join(',')})`);
    params.push(...tagIDs!);
  }

  // ---------- ORDER clause selection ----------
  // updated / random are cheap. yourRating also cheap (bounded to user).
  // userRating (global aggregate) is expensive without precomputed stats.
  // Note: When we have filters that require GROUP BY (tags, search, categories),
  // we can't order by ur.rating in the top_ids CTE because it becomes ambiguous after GROUP BY.
  // So we'll order by yourRating in the final SELECT instead.
  const canOrderInTopCte = !needTagJoin && !search;
  let orderSql = `c.updated DESC, c.id DESC`;
  if (order === 'random') orderSql = `RANDOM()`;
  if (order === 'yourRating' && userId && canOrderInTopCte)
    orderSql = `ur.rating DESC, c.updated DESC, c.id DESC`;

  if (order === 'userRating' && canOrderInTopCte) {
    orderSql = 'rs.sumStars DESC, c.updated DESC, c.id DESC';
  }

  const limitSql = limit ? `LIMIT ?` : ``;
  const offsetSql = offset ? `OFFSET ?` : ``;

  // ---------- CTE: top_ids (tiny set) ----------
  // We join artist only when search requires it (so the main WHERE can filter on a.name).
  const joinArtistForSearch =
    search && search.trim() ? `JOIN artist a ON a.id = c.artist` : '';

  // Optional user rating in the top_ids ORDER BY
  const joinUrInTop =
    order === 'yourRating' && userId && canOrderInTopCte
      ? `LEFT JOIN comicrating ur ON (ur.comicId = c.id AND ur.userId = ?)`
      : ``;

  if (order === 'yourRating' && userId && canOrderInTopCte) params.push(userId);

  const joinRsInTop =
    order === 'userRating'
      ? `LEFT JOIN comicratingaggregation rs ON rs.comicId = c.id`
      : ``;

  const tagJoinForFilter = needTagJoin
    ? `INNER JOIN comickeyword ckf ON ckf.comicId = c.id`
    : ``;

  const topIdsCte = `
    WITH top_ids AS (
      SELECT c.id
      FROM comic c
      ${tagJoinForFilter}
      ${joinArtistForSearch}
      ${joinUrInTop}
      ${joinRsInTop}
      WHERE ${whereParts.join(' AND ')}
      ${needTagJoin ? `GROUP BY c.id` : ``}
      ${needTagJoin ? `HAVING COUNT(DISTINCT ckf.keywordId) >= ${tagIDs?.length ?? 0}` : ``}
      ORDER BY ${orderSql}
      ${limitSql} ${offsetSql}
    )
  `;

  if (limit) params.push(limit);
  if (offset) params.push(offset);

  // ---------- CTEs: aggregates only for the selected IDs ----------
  const ratingsCte = `
    , ratings AS (
      SELECT cr.comicId,
             SUM(cr.rating) AS sumStars,
             COUNT(*)       AS numTimesStarred
      FROM comicrating cr
      WHERE cr.comicId IN (SELECT id FROM top_ids)
      GROUP BY cr.comicId
    )
  `;

  const yourRatingCte = userId
    ? `
    , your_rating AS (
      SELECT cr.comicId, cr.rating
      FROM comicrating cr
      WHERE cr.userId = ? AND cr.comicId IN (SELECT id FROM top_ids)
    )
  `
    : ``;

  if (userId) params.push(userId);

  const bookmarksCte = userId
    ? `
    , bookmarks AS (
      SELECT cb.comicId, 1 AS isBookmarked
      FROM comicbookmark cb
      WHERE cb.userId = ? AND cb.comicId IN (SELECT id FROM top_ids)
    )
  `
    : ``;

  if (userId) params.push(userId);

  const tagsCte = includeTags
    ? `
    , tags AS (
      SELECT ck.comicId,
             GROUP_CONCAT(DISTINCT (kw.keywordName || '~' || kw.id)) AS tags
      FROM comickeyword ck
      JOIN keyword kw ON kw.id = ck.keywordId
      WHERE ck.comicId IN (SELECT id FROM top_ids)
      GROUP BY ck.comicId
    )
  `
    : ``;

  // ---------- Final SELECT ----------
  const finalOrder =
    order === 'random'
      ? `ORDER BY RANDOM()`
      : order === 'yourRating' && userId
        ? `ORDER BY yourStars DESC, c.updated DESC, c.id DESC`
        : order === 'userRating'
          ? `ORDER BY COALESCE(r.sumStars, 0) DESC, c.updated DESC, c.id DESC`
          : `ORDER BY c.updated DESC, c.id DESC`;

  const finalSelect = `
    SELECT
      c.id,
      c.name,
      c.category,
      COALESCE(a.name, '') AS artistName,
      c.updated,
      c.state,
      c.published,
      c.numberOfPages,
      COALESCE(r.sumStars, 0)       AS sumStars,
      COALESCE(r.numTimesStarred, 0) AS numTimesStarred
      ${userId ? `, yr.rating AS yourStars, COALESCE(b.isBookmarked,0) AS isBookmarked` : ``}
      ${includeTags ? `, t.tags` : ``}
    FROM top_ids ti
    JOIN comic  c ON c.id = ti.id
    LEFT JOIN artist a ON a.id = c.artist
    LEFT JOIN ratings      r  ON r.comicId = c.id
    ${userId ? `LEFT JOIN your_rating  yr ON yr.comicId = c.id` : ``}
    ${userId ? `LEFT JOIN bookmarks    b  ON b.comicId  = c.id` : ``}
    ${includeTags ? `LEFT JOIN tags    t  ON t.comicId  = c.id` : ``}
    ${finalOrder}
  `;

  const query = `
    ${topIdsCte}
    ${ratingsCte}
    ${yourRatingCte}
    ${bookmarksCte}
    ${tagsCte}
    ${finalSelect}
  `;

  return { query, params };
}
