import type { ComicForBrowse } from '~/types/types';
import { browsePageSize } from '~/types/types';
import { queryDbMultiple } from '~/utils/database-facade';
import type { ResultOrErrorPromise } from '~/utils/request-helpers';
import { makeDbErrObj } from '~/utils/request-helpers';

type ComicForBrowseDB = Omit<ComicForBrowse, 'tags'> & { tags?: string };

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
  includeTags?: boolean;
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
  if (order === 'random') orderBy = 'RANDOM()';
  if (!['updated', 'userRating', 'yourRating', 'RANDOM()'].includes(orderBy))
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

  const includeTagsJoinString = includeTags
    ? `LEFT JOIN comickeyword AS ck1 ON (ck1.comicId = comic.id)
       INNER JOIN keyword ON (keyword.id = ck1.keywordId)`
    : '';
  const includeTagsConcatString = includeTags
    ? `, GROUP_CONCAT(DISTINCT keyword.keywordName || '~' || keyword.id) AS tags`
    : '';

  const innerComicQuery = `
    SELECT 
      comic.id AS id, comic.name, comic.tag AS category,
      artist.name AS artistName, comic.updated, comic.state, comic.published, comic.numberOfPages 
      ${userId ? ', voteQuery.yourVote AS yourRating' : ''}
      ${includeTagsConcatString}
    FROM comic 
    ${includeTagsJoinString}
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
    SELECT cc.id, cc.name, cc.category, cc.artistName, 
    cc.updated, cc.state, cc.published, cc.numberOfPages, AVG(comicvote.vote) AS userRating, 
    ${userId ? 'cc.yourRating' : '0 AS yourRating'}
    ${includeTags ? ', cc.tags' : ''}
    FROM (
      ${innerComicQuery}
    ) AS cc 
    LEFT JOIN comicvote ON (cc.id = comicvote.comicId) 
    GROUP BY name, id 
    ${order === 'userRating' ? orderQueryString + paginationQueryString : ''} 
  `;

  const dbRes = await queryDbMultiple<[ComicForBrowseDB[], { count: number }[]]>(db, [
    { query, params: queryParams },
    {
      query: totalCountQuery,
      params: totalCountQueryParams,
    },
  ]);

  if (dbRes.isError) {
    return makeDbErrObj(dbRes, 'Error getting comics+count', logCtx);
  }

  const [comicsRaw, countDbRes] = dbRes.result;
  let comics: ComicForBrowse[];

  if (includeTags) {
    comics = comicsRaw.map(c => ({
      ...c,
      tags: c.tags?.split(',').map(tag => {
        const [name, id] = tag.split('~');
        return { name, id: parseInt(id, 10) };
      }),
    }));
  } else {
    comics = comicsRaw as ComicForBrowse[];
  }

  return {
    result: {
      comics,
      numberOfPages: Math.ceil(countDbRes[0].count / browsePageSize),
      totalNumComics: countDbRes[0].count,
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
