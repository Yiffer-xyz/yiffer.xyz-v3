import { AnyKindOfComic } from '~/routes/contribute/upload';
import { queryDbDirect } from '~/utils/database-facade';

export async function getAllComicNamesAndIDs(urlBase: string): Promise<AnyKindOfComic[]> {
  let normalComicsQuery = 'SELECT Name AS comicName, Id AS comicId FROM comic';
  let pendingComicsQuery =
    'SELECT Name AS comicName, Id AS comicId FROM pendingcomic WHERE processed=0';
  let uploadComicsQuery = `SELECT ComicName AS comicName, Id AS comicId FROM comicupload WHERE Status = 'pending'`;

  let [normalComics, pendingComics, uploadComics] = await Promise.all([
    queryDbDirect<AnyKindOfComic[]>(urlBase, normalComicsQuery),
    queryDbDirect<AnyKindOfComic[]>(urlBase, pendingComicsQuery),
    queryDbDirect<AnyKindOfComic[]>(urlBase, uploadComicsQuery),
  ]);

  const response = [
    ...normalComics.map(comic => ({
      comicName: comic.comicName,
      comicId: comic.comicId,
      isPending: false,
      isUpload: false,
    })),
    ...pendingComics.map(comic => ({
      comicName: comic.comicName,
      comicId: comic.comicId,
      isPending: true,
      isUpload: false,
    })),
    ...uploadComics.map(comic => ({
      comicName: comic.comicName,
      comicId: comic.comicId,
      isPending: false,
      isUpload: true,
    })),
  ];

  return response;
}
