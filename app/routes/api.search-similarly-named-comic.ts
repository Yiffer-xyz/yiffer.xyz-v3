import type { noGetRoute, ResultOrErrorPromise } from '~/utils/request-helpers';
import {
  createSuccessJson,
  processApiError,
  wrapApiError,
} from '~/utils/request-helpers';
import { stringDistance } from '~/utils/string-utils';
import { getComicNamesAndIDs } from '../route-funcs/get-comics';
import type { ActionFunctionArgs } from '@remix-run/cloudflare';

export { noGetRoute as loader };

export type SimilarComicResponse = {
  similarComics: string[];
  exactMatchComic?: string;
  similarRejectedComics: string[];
  exactMatchRejectedComic?: string;
};

export async function action(args: ActionFunctionArgs) {
  const body = await args.request.formData();
  const comicName = body.get('comicName') as string;
  const excludeName = body.get('excludeName');

  const comicsRes = await getSimilarlyNamedComics(
    args.context.cloudflare.env.DB,
    comicName,
    excludeName ? excludeName.toString() : undefined
  );
  if (comicsRes.err) {
    return processApiError('Error in /search-similarly-named-comics', comicsRes.err, {
      comicName,
      excludeName,
    });
  }
  return createSuccessJson(comicsRes.result);
}

export async function getSimilarlyNamedComics(
  db: D1Database,
  comicName: string,
  excludeName?: string
): ResultOrErrorPromise<SimilarComicResponse> {
  const logCtx = { comicName, excludeName };
  if (comicName.length < 2) {
    return { result: { similarComics: [], similarRejectedComics: [] } };
  }
  const comicNameLower = comicName.toLowerCase();
  let distanceThreshold = 4;
  if (comicNameLower.length < 14) {
    distanceThreshold = 3;
  }
  if (comicNameLower.length < 5) {
    distanceThreshold = 2;
  }

  const response: SimilarComicResponse = {
    similarComics: [],
    exactMatchComic: undefined,
    similarRejectedComics: [],
    exactMatchRejectedComic: undefined,
  };

  const allComicsTinyRes = await getComicNamesAndIDs(db, {
    includeRejectedList: true,
    includeUnlisted: true,
  });
  if (allComicsTinyRes.err) {
    return {
      err: wrapApiError(allComicsTinyRes.err, 'error getting similar comics', logCtx),
    };
  }

  for (const comic of allComicsTinyRes.result.filter(
    c =>
      c.name !== excludeName &&
      (c.publishStatus === 'published' ||
        c.publishStatus === 'pending' ||
        c.publishStatus === 'scheduled')
  )) {
    const distance = stringDistance(comicName, comic.name);

    if (distance === 0) {
      response.exactMatchComic = comic.name;
    } else if (distance <= distanceThreshold) {
      response.similarComics.push(comic.name);
    }
  }

  for (const comic of allComicsTinyRes.result.filter(
    c =>
      c.name !== excludeName &&
      (c.publishStatus === 'uploaded' ||
        c.publishStatus === 'rejected' ||
        c.publishStatus === 'rejected-list')
  )) {
    const distance = stringDistance(comicName, comic.name);
    if (distance === 0) {
      if (comic.publishStatus === 'rejected-list') {
        response.exactMatchRejectedComic = comic.name;
      } else {
        response.exactMatchComic = comic.name;
      }
    } else if (distance <= distanceThreshold) {
      if (comic.publishStatus === 'rejected-list') {
        response.similarRejectedComics.push(comic.name);
      } else {
        response.similarComics.push(comic.name);
      }
    }
  }

  return { result: response };
}
