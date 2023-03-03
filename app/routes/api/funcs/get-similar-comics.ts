import { AnyKindOfComic } from '~/routes/contribute/upload';
import { UploadedComic } from '~/types/types';
import { queryDbDirect } from '~/utils/database-facade';
import stringDistance from '~/utils/string-distance';
import { SimilarComicResponse } from '../search-similar-comic';

export async function getSimilarComics(
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

  let allComicsQuery = 'SELECT Name AS comicName FROM comic';
  let pendingComicsQuery = 'SELECT Name AS comicName FROM pendingcomic WHERE processed=0';
  let uploadComicsQuery = `SELECT ComicName AS name, Status AS status FROM comicupload 
  WHERE Status = 'pending' OR Status = 'rejected-list'`;

  let response: SimilarComicResponse = {
    similarComics: [],
    exactMatchComic: undefined,
    similarRejectedComics: [],
    exactMatchRejectedComic: undefined,
  };

  let [allComics, pendingComics, uploadComics] = await Promise.all([
    queryDbDirect<AnyKindOfComic[]>(urlBase, allComicsQuery, []),
    queryDbDirect<AnyKindOfComic[]>(urlBase, pendingComicsQuery, []),
    queryDbDirect<UploadedComic[]>(urlBase, uploadComicsQuery, []),
  ]);
  let anyComicsArray = [...allComics, ...pendingComics];

  for (let comic of anyComicsArray) {
    let distance = stringDistance(comicName, comic.comicName);
    if (distance === 0) {
      response.exactMatchComic = comic.comicName;
    } else if (distance <= distanceThreshold) {
      response.similarComics.push(comic.comicName);
    }
  }
  for (let comic of uploadComics) {
    let distance = stringDistance(comicName, comic.name);
    if (distance === 0) {
      if (comic.status === 'rejected-list') {
        response.exactMatchRejectedComic = comic.name;
      } else {
        response.exactMatchComic = comic.name;
      }
    } else if (distance <= distanceThreshold) {
      if (comic.status === 'rejected-list') {
        response.similarRejectedComics.push(comic.name);
      } else {
        response.similarComics.push(comic.name);
      }
    }
  }

  return response;
}
