import type { ComicForBrowse } from '~/types/types';
import { browsePageSize } from '~/types/types';
import { queryDb } from '~/utils/database-facade';
import type { ResultOrErrorPromise } from '~/utils/request-helpers';
import { makeDbErrObj } from '~/utils/request-helpers';

type GetComicsParams = {
  urlBase: string;
  userId?: number;
  limit?: number;
  offset?: number;
  categories?: string[];
  tagIDs?: number[];
  search?: string;
  order?: 'updated' | 'userRating' | 'yourRating' | 'random';
  artistId?: number;
};

export async function getComicsPaginated({
  urlBase,
  userId,
  limit,
  offset,
  categories,
  tagIDs,
  search,
  order,
  artistId,
}: GetComicsParams): ResultOrErrorPromise<{
  comics: ComicForBrowse[];
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
    !artistId;

  let orderBy = (order ?? 'updated') as string;
  if (order === 'random') orderBy = 'RAND()';
  if (!['updated', 'userRating', 'yourRating', 'RAND()'].includes(orderBy))
    orderBy = 'updated';
  const orderQueryString = `ORDER BY ${orderBy} DESC`;

  let paginationQueryString = '';
  if (limit) {
    paginationQueryString += ' LIMIT ? ';
  }
  if (offset) {
    paginationQueryString += ' OFFSET ? ';
  }

  const comicVoteQuery = `
    LEFT JOIN (
      SELECT comicId, vote AS yourVote 
      FROM comicvote 
      WHERE userId = ?
    ) AS voteQuery ON (comic.id = voteQuery.comicId) 
  `;

  const innerComicQuery = `
    SELECT 
      comic.id AS id, comic.name, comic.cat AS classification, comic.tag AS category,
      artist.name AS artistName, comic.updated, comic.state, comic.published, comic.numberOfPages 
      ${userId ? ', voteQuery.yourVote AS yourRating' : ''}
    FROM comic 
    ${innerJoinKeywordString}
    INNER JOIN artist ON (artist.id = comic.artist) 
    ${userId ? comicVoteQuery : ''} 
    ${filterQueryString}
    GROUP BY comic.name, comic.id 
    ${keywordCountString} 
    ${order === 'userRating' ? '' : orderQueryString + paginationQueryString} 
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

  if (userId) {
    queryParams = [userId];
  }
  queryParams.push(...filterQueryParams);
  totalCountQueryParams.push(...filterQueryParams);

  if (limit) {
    queryParams.push(limit);
  }
  if (offset) {
    queryParams.push(offset);
  }

  const query = `
    SELECT cc.id, cc.name, cc.classification, cc.category, cc.artistName, 
    cc.updated, cc.state, cc.published, cc.numberOfPages, AVG(comicvote.Vote) AS userRating, 
    ${userId ? 'cc.yourRating' : '0 AS yourRating'}
    FROM (
      ${innerComicQuery}
    ) AS cc 
    LEFT JOIN comicvote ON (cc.Id = comicvote.ComicId) 
    GROUP BY name, id 
    ${order === 'userRating' ? orderQueryString + paginationQueryString : ''} 
  `;

  const [dbRes, countDbRes] = await Promise.all([
    queryDb<ComicForBrowse[]>(urlBase, query, queryParams),
    queryDb<{ count: number }[]>(urlBase, totalCountQuery, totalCountQueryParams),
  ]);

  if (dbRes.isError) {
    return makeDbErrObj(dbRes, 'Error getting comics', logCtx);
  }
  if (countDbRes.isError) {
    return makeDbErrObj(countDbRes, 'Error getting count', logCtx);
  }

  return {
    result: {
      comics: dbRes.result,
      numberOfPages: Math.ceil(countDbRes.result[0].count / browsePageSize),
      totalNumComics: countDbRes.result[0].count,
      page: Math.ceil((offset ?? 0) / browsePageSize) + 1,
    },
  };
}

export function getFilterQuery({
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
  let filterQueryString = 'WHERE publishStatus = "published"';
  const filterQueryParams = [];
  let innerJoinKeywordString = '';
  let keywordCountString = '';

  if (categories || search || keywordIds || artistId) {
    const queries = [];

    if (keywordIds) {
      keywordCountString = `HAVING COUNT(*) >= ${keywordIds.length}`;
      const keywordQueryStrings: string[] = [];
      keywordIds.forEach(kwId => {
        filterQueryParams.push(kwId);
        keywordQueryStrings.push(' comickeyword.keywordId=? ');
      });
      queries.push(`(${keywordQueryStrings.join('OR')})`);
      innerJoinKeywordString =
        'INNER JOIN comickeyword ON (comic.Id = comickeyword.comicId)';
    }

    if (categories) {
      const categoryStrings: string[] = [];
      categories.forEach(category => {
        filterQueryParams.push(category);
        // TODO: In the future, rename this shit, it's so bad
        categoryStrings.push(' Tag = ? ');
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
