import { ActionArgs } from '@remix-run/cloudflare';
import {
  ApiError,
  createSuccessJson,
  logApiErrorMessage,
  processApiError,
  wrapApiError,
} from '~/utils/request-helpers';
import stringDistance from '~/utils/string-distance';
import { getAllComicNamesAndIDs } from './funcs/get-comics';

export type SimilarComicResponse = {
  similarComics: string[];
  exactMatchComic?: string;
  similarRejectedComics: string[];
  exactMatchRejectedComic?: string;
};

export async function action(args: ActionArgs) {
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

  let response: SimilarComicResponse = {
    similarComics: [],
    exactMatchComic: undefined,
    similarRejectedComics: [],
    exactMatchRejectedComic: undefined,
  };

  let allComicsTinyRes = await getAllComicNamesAndIDs(urlBase, {
    includeRejectedList: true,
    includeUnlisted: true,
  });
  if (allComicsTinyRes.err) {
    return {
      err: wrapApiError(allComicsTinyRes.err, 'error getting similar comics', logCtx),
    };
  }

  for (let comic of (allComicsTinyRes.comics || []).filter(
    c =>
      c.name !== excludeName &&
      (c.publishStatus === 'published' ||
        c.publishStatus === 'pending' ||
        c.publishStatus === 'scheduled')
  )) {
    let distance = stringDistance(comicName, comic.name);

    if (distance === 0) {
      response.exactMatchComic = comic.name;
    } else if (distance <= distanceThreshold) {
      response.similarComics.push(comic.name);
    }
  }

  for (let comic of (allComicsTinyRes.comics || []).filter(
    c =>
      c.name !== excludeName &&
      (c.publishStatus === 'uploaded' ||
        c.publishStatus === 'rejected' ||
        c.publishStatus === 'rejected-list')
  )) {
    let distance = stringDistance(comicName, comic.name);
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
