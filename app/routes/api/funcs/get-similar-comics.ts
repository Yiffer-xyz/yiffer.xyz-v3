import stringDistance from '~/utils/string-distance';
import { SimilarComicResponse } from '../search-similarly-named-comic';
import { getAllComicNamesAndIDs } from './get-comics';

export async function getSimilarlyNamedComics(
  urlBase: string,
  comicName: string
): Promise<SimilarComicResponse> {
  if (comicName.length < 2) {
    return { similarComics: [], similarRejectedComics: [] };
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

  let allComicsTiny = await getAllComicNamesAndIDs(urlBase, {
    includeRejectedList: true,
    includeUnlisted: true,
  });

  for (let comic of allComicsTiny.filter(
    c =>
      c.publishStatus === 'published' ||
      c.publishStatus === 'pending' ||
      c.publishStatus === 'scheduled'
  )) {
    let distance = stringDistance(comicName, comic.name);

    if (distance === 0) {
      response.exactMatchComic = comic.name;
    } else if (distance <= distanceThreshold) {
      response.similarComics.push(comic.name);
    }
  }

  for (let comic of allComicsTiny.filter(
    c =>
      c.publishStatus === 'uploaded' ||
      c.publishStatus === 'rejected' ||
      c.publishStatus === 'rejected-list'
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

  return response;
}
