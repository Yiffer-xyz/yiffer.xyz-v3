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
  if (offset) queryExtraInfos.push(`offset`);
  if (order) queryExtraInfos.push(`order`);
  const queryExtraInfo = queryExtraInfos.join(', ');

  const canUseEfficientQuery =
    (!tagIDs || tagIDs.length === 0) &&
    (!search || search.trim() === '') &&
    !artistId &&
    (order === 'updated' || order === 'random');

  const [
    filterQueryString,
    filterQueryParams,
    keywordCountString,
    innerJoinKeywordString,
  ] = getFilterQuery({ categories, keywordIds: tagIDs, search, artistId });

  const orderBy = orderByParamToDbField(order ?? 'updated');
  const orderQueryString = `ORDER BY ${orderBy} DESC`;

  let paginationQueryString = '';
  if (limit) {
    paginationQueryString += ' LIMIT ? ';
  }
  if (offset) {
    paginationQueryString += ' OFFSET ? ';
  }
  const isBookmarkedQuery = `
    ${bookmarkedOnly ? 'INNER JOIN' : 'LEFT JOIN'} (
      SELECT comicId, 1 as isBookmarked
      FROM comicbookmark
      WHERE userId = ?
    ) AS isBookmarkedQuery ON (comic.id = isBookmarkedQuery.comicId)
  `;

  const yourStarsQuery =
    'LEFT JOIN comicrating AS userCR ON comic.id = userCR.comicId AND userCR.userId = ?';

  const includeTagsJoinString = includeTags
    ? `LEFT JOIN comickeyword AS ck1 ON (ck1.comicId = comic.id)
       LEFT JOIN keyword ON (keyword.id = ck1.keywordId)`
    : '';
  const includeTagsConcatString = includeTags
    ? `, GROUP_CONCAT(DISTINCT keyword.keywordName || '~' || keyword.id) AS tags`
    : '';

  const { query: innerQuery, params: queryParams } = canUseEfficientQuery
    ? makeEfficientInnerQuery({
        order,
        limit,
        offset,
        userId,
        categories,
        isBookmarkedQuery,
        includeTagsJoinString,
        includeTagsConcatString,
        innerJoinKeywordString: innerJoinKeywordString as string,
        yourStarsQuery,
        filterQueryString: filterQueryString as string,
      })
    : makeInefficientInnerQuery({
        userId,
        order: order ?? 'updated',
        limit,
        offset,
        yourStarsQuery,
        includeTagsJoinString,
        includeTagsConcatString,
        innerJoinKeywordString: innerJoinKeywordString as string,
        filterQueryString: filterQueryString as string,
        filterQueryParams: filterQueryParams as any[],
        keywordCountString: keywordCountString as string,
        orderQueryString,
        paginationQueryString,
        isBookmarkedQuery,
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

  const query = `
    SELECT cc.id, cc.name, cc.category, cc.artistName,
    cc.updated, cc.state, cc.published, cc.numberOfPages, 
    cc.sumStars, cc.numTimesStarred
    ${userId ? ', cc.yourStars, cc.isBookmarked ' : ''}
    ${includeTags ? ', cc.tags' : ''}
    FROM (
      ${innerQuery}
    ) AS cc 
    GROUP BY id 
    ${orderQueryString}
  `;

  const queries = [
    {
      query,
      params: queryParams,
      queryName: `Comics paginated ${canUseEfficientQuery ? 'efficient' : 'inefficient'}`,
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

type MakeInefficientQueryArgs = {
  userId: number | undefined;
  order: 'updated' | 'random' | 'userRating' | 'yourRating';
  limit: number | undefined;
  offset: number | undefined;
  yourStarsQuery: string;
  includeTagsJoinString: string;
  includeTagsConcatString: string;
  innerJoinKeywordString: string;
  filterQueryString: string;
  filterQueryParams: any[];
  keywordCountString: string;
  orderQueryString: string;
  paginationQueryString: string;
  isBookmarkedQuery: string;
};

function makeInefficientInnerQuery({
  userId,
  order,
  limit,
  offset,
  yourStarsQuery,
  includeTagsJoinString,
  includeTagsConcatString,
  innerJoinKeywordString,
  filterQueryString,
  filterQueryParams,
  keywordCountString,
  orderQueryString,
  paginationQueryString,
  isBookmarkedQuery,
}: MakeInefficientQueryArgs): { query: string; params: any[] } {
  const query = `
    SELECT
      comic.id AS id, comic.name, comic.category, comic.publishStatus,
      artist.name AS artistName, comic.updated, comic.state, comic.published, comic.numberOfPages,
      COALESCE(comicRatings.sumStars, 0) AS sumStars,
      COALESCE(comicRatings.numTimesStarred, 0) AS numTimesStarred
      ${userId ? ', userCR.rating AS yourStars' : ''}
      ${userId ? ', isBookmarkedQuery.isBookmarked AS isBookmarked' : ''}
      ${includeTagsConcatString}
    FROM comic
    INNER JOIN artist ON (artist.id = comic.artist)
    LEFT JOIN (
      SELECT comicId, SUM(rating) AS sumStars, COUNT(rating) AS numTimesStarred
      FROM comicrating
      GROUP BY comicId
    ) AS comicRatings ON comic.id = comicRatings.comicId
    ${includeTagsJoinString}
    ${innerJoinKeywordString}
    ${userId ? yourStarsQuery : ''}
    ${userId ? isBookmarkedQuery : ''}
    ${filterQueryString}
    GROUP BY comic.id
    ${keywordCountString}
    ${orderQueryString}
    ${paginationQueryString}
  `;

  const params: any[] = [];

  if (userId) params.push(userId, userId); // For bookmarked and yourStars
  params.push(...filterQueryParams);
  if (limit) params.push(limit);
  if (offset) params.push(offset);

  return { query: query, params: params };
}

type MakeEfficientInnerQueryArgs = {
  order: 'updated' | 'random';
  limit: number | undefined;
  offset: number | undefined;
  userId: number | undefined;
  categories?: string[];
  isBookmarkedQuery: string;
  includeTagsConcatString: string;
  includeTagsJoinString: string;
  innerJoinKeywordString: string;
  yourStarsQuery: string;
  filterQueryString: string;
};

function makeEfficientInnerQuery({
  order,
  limit,
  offset,
  userId,
  categories,
  isBookmarkedQuery,
  includeTagsConcatString,
  includeTagsJoinString,
  innerJoinKeywordString,
  yourStarsQuery,
}: MakeEfficientInnerQueryArgs) {
  let whereString = `WHERE publishStatus = 'published'`;
  const params: any[] = [];
  const categoriesParams: any[] = [];

  if (categories && categories.length > 0) {
    const categoryStrings: string[] = [];
    categories.forEach(category => {
      categoryStrings.push(`category = ?`);
      categoriesParams.push(category);
    });
    whereString += ` AND (${categoryStrings.join(' OR ')})`;
  }

  const limitString = limit ? `LIMIT ?` : '';
  const offsetString = offset ? `OFFSET ?` : '';
  const orderByString =
    order === 'random' ? 'ORDER BY RANDOM()' : `ORDER BY updated DESC`;

  const query = `
    WITH filtered_comics AS (
      SELECT id, updated, ${userId ? 'isBookmarkedQuery.isBookmarked AS isBookmarked' : '0 AS isBookmarked'},
      SUM(comicrating.rating) AS sumStars, COUNT(comicrating.rating) AS numTimesStarred
      FROM comic
      LEFT JOIN comicrating ON (comic.id = comicrating.comicId)
      ${userId ? isBookmarkedQuery : ''}
      ${whereString}
      GROUP BY id
      ${orderByString}
      ${limitString} ${offsetString}
    )
    SELECT
      comic.id AS id,
      comic.name,
      comic.category,
      comic.publishStatus,
      artist.name AS artistName,
      comic.updated,
      comic.state,
      comic.published,
      comic.numberOfPages,
      isBookmarked,
      sumStars,
      numTimesStarred
      ${userId ? ', userCR.rating AS yourStars' : ''}
      ${userId ? ', isBookmarked AS isBookmarked' : ''}
      ${includeTagsConcatString}
    FROM filtered_comics
    INNER JOIN comic ON comic.id = filtered_comics.id
    INNER JOIN artist ON artist.id = comic.artist
    ${includeTagsJoinString}
    ${innerJoinKeywordString}
    ${userId ? yourStarsQuery : ''}
    GROUP BY comic.id
  `;

  if (userId) params.push(userId); // For bookmarked
  params.push(...categoriesParams);
  if (limit) params.push(limit);
  if (offset) params.push(offset);
  if (userId) params.push(userId); // For yourStars

  return { query: query, params: params };
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

function orderByParamToDbField(orderBy: string) {
  switch (orderBy) {
    case 'updated':
      return 'updated';
    case 'userRating':
      return 'sumStars';
    case 'yourRating':
      return 'yourStars';
    case 'random':
      return 'RANDOM()';
    default:
      return 'updated';
  }
}
