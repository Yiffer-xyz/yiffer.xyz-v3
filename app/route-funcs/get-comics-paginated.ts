import { ADS_PER_PAGE, COMICS_PER_PAGE } from '~/types/constants';
import type { AdForViewing, ComicForBrowse } from '~/types/types';
import { queryDbMultiple } from '~/utils/database-facade';
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
  artistName,
  includeTags,
  includeAds,
}: GetComicsParams): ResultOrErrorPromise<{
  comicsAndAds: (ComicForBrowse | AdForViewing)[];
  numberOfPages: number;
  totalNumComics: number;
  page: number;
}> {
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
    artistName,
  };

  const [
    filterQueryString,
    filterQueryParams,
    keywordCountString,
    innerJoinKeywordString,
  ] = getFilterQuery({ categories, keywordIds: tagIDs, search, artistId });

  const isUnfilteredQuery =
    (!categories || categories.length === 0) &&
    (!tagIDs || tagIDs.length === 0) &&
    !search &&
    !artistId &&
    !artistName;

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
    LEFT JOIN (
      SELECT comicId, 1 as isBookmarked
      FROM comicbookmark
      WHERE userId = ?
    ) AS isBookmarkedQuery ON (comic.id = isBookmarkedQuery.comicId)
  `;

  const yourStarsQuery =
    'LEFT JOIN comicrating AS userCR ON comic.id = userCR.comicId AND userCR.userId = ?';

  const includeTagsJoinString = includeTags
    ? `LEFT JOIN comickeyword AS ck1 ON (ck1.comicId = comic.id)
       INNER JOIN keyword ON (keyword.id = ck1.keywordId)`
    : '';
  const includeTagsConcatString = includeTags
    ? `, GROUP_CONCAT(DISTINCT keyword.keywordName || '~' || keyword.id) AS tags`
    : '';

  const innerComicQuery = `
    SELECT
      comic.id AS id, comic.name, comic.category, comic.publishStatus,
      artist.name AS artistName, comic.updated, comic.state, comic.published, comic.numberOfPages
      ${userId ? ', userCR.rating AS yourStars' : ''}
      ${userId ? ', isBookmarkedQuery.isBookmarked AS isBookmarked' : ''}
      ${includeTagsConcatString}
    FROM comic
    INNER JOIN artist ON (artist.id = comic.artist)
    ${includeTagsJoinString}
    ${innerJoinKeywordString}
    ${userId ? yourStarsQuery : ''}
    ${userId ? isBookmarkedQuery : ''}
    ${filterQueryString}
    GROUP BY comic.name, comic.id
    ${keywordCountString}
    ${order === 'userRating' ? '' : orderQueryString}
    ${paginationQueryString}
  `;

  const totalCountQuery = isUnfilteredQuery
    ? `SELECT COUNT(*) AS count FROM comic WHERE publishStatus = 'published'`
    : `SELECT COUNT(*) AS count FROM (
        SELECT comic.id
        FROM comic
        ${innerJoinKeywordString}
        ${search ? ' INNER JOIN artist ON (artist.id = comic.artist) ' : ''}
        ${filterQueryString}
        GROUP BY comic.name, comic.id
        ${keywordCountString}
      ) AS cc
    `;

  let queryParams: any[] = [];
  const totalCountQueryParams: any[] = [];

  // For bookmarked and yourStars queries
  if (userId) {
    queryParams = [userId, userId];
  }
  queryParams.push(...filterQueryParams);
  totalCountQueryParams.push(...filterQueryParams);

  if (limit) {
    queryParams.push(limit);
  }
  if (offset) {
    queryParams.push(offset);
  }

  let artistNameFilterString = '';
  if (artistName) {
    artistNameFilterString = 'WHERE cc.artistName = ?';
    queryParams.push(artistName);
  }

  const query = `
    SELECT cc.id, cc.name, cc.category, cc.artistName,
    cc.updated, cc.state, cc.published, cc.numberOfPages, 
    SUM(comicrating.rating) AS sumStars, COUNT(comicrating.rating) AS numTimesStarred
    ${userId ? ', cc.yourStars, cc.isBookmarked ' : ''}
    ${includeTags ? ', cc.tags' : ''}
    FROM (
      ${innerComicQuery}
    ) AS cc 
    LEFT JOIN comicrating ON (cc.id = comicrating.comicId) 
    ${artistNameFilterString}
    GROUP BY name, id 
    ${orderQueryString} 
  `;

  const queries = [
    { query, params: queryParams },
    {
      query: totalCountQuery,
      params: totalCountQueryParams,
    },
  ];

  if (includeAds) {
    const adsQueryAndParams = {
      query: `SELECT id, link, mainText, secondaryText, isAnimated
        FROM advertisement
        WHERE adType = 'card' AND status = 'ACTIVE'
        ORDER BY RANDOM() LIMIT ${COMICS_PER_PAGE} 
      `,
      params: [],
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
    published: new Date(c.published),
    updated: new Date(c.updated),
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

function addAdsToComics(
  comics: ComicForBrowse[],
  ads: AdForViewing[]
): (ComicForBrowse | AdForViewing)[] {
  const numComicsBetweenAds = Math.ceil(COMICS_PER_PAGE / ADS_PER_PAGE);
  const comicsWithAds: (ComicForBrowse | AdForViewing)[] = [];
  let adIndex = 0;

  // Mix ads into comic list, starting at index (numComicsBetweenAds +- 2) for variation,
  // then every numComicsBetweenAds after that.

  const firstAdRandomizer = Math.floor(Math.random() * 5) - 2;
  const firstAdIndex = numComicsBetweenAds + firstAdRandomizer;

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
