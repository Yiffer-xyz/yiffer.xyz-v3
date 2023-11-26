import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import type { ApiError } from '~/utils/request-helpers';
import {
  createSuccessJson,
  logApiErrorMessage,
  processApiError,
  wrapApiError,
} from '~/utils/request-helpers';
import stringDistance from '~/utils/string-distance';
import { getAllComicNamesAndIDs } from '../route-funcs/get-comics';

export type SimilarComicResponse = {
  similarComics: string[];
  exactMatchComic?: string;
  similarRejectedComics: string[];
  exactMatchRejectedComic?: string;
};

export async function action(args: ActionFunctionArgs) {
  const urlBase = args.context.DB_API_URL_BASE;
  const body = await args.request.formData();
  const comicName = body.get('comicName') as string;
  const excludeName = body.get('excludeName');

  const res = await getSimilarlyNamedComics(
    urlBase,
    comicName,
    excludeName ? excludeName.toString() : undefined
  );

  if (res.err) {
    return processApiError('Error in /search-similarly-named-comics', res.err, {
      comicName,
      excludeName,
    });
  }
  if (!res.comics) {
    return logApiErrorMessage('Undefined db res in /search-similarly-named-comics', {
      comicName,
      excludeName,
    });
  }

  return createSuccessJson(res.comics);
}

export async function getSimilarlyNamedComics(
  urlBase: string,
  comicName: string,
  excludeName?: string
): Promise<{ err?: ApiError; comics?: SimilarComicResponse }> {
  const logCtx = { comicName, excludeName };
  if (comicName.length < 2) {
    return { comics: { similarComics: [], similarRejectedComics: [] } };
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

  const allComicsTinyRes = await getAllComicNamesAndIDs(urlBase, {
    includeRejectedList: true,
    includeUnlisted: true,
  });
  if (allComicsTinyRes.err) {
    return {
      err: wrapApiError(allComicsTinyRes.err, 'error getting similar comics', logCtx),
    };
  }

  for (const comic of (allComicsTinyRes.comics || []).filter(
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

  for (const comic of (allComicsTinyRes.comics || []).filter(
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

  return { comics: response };
}