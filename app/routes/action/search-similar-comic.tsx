import { ActionFunction, json } from '@remix-run/cloudflare';
import stringDistance from '~/utils/string-distance';

type ComicNameStruct = {
  name: string;
};

export const action: ActionFunction = async function ({ request }) {
  const body = await request.formData();
  const newComicName = body.get('comicName') as string;
  if (!newComicName) {
    return json([]);
  }

  // TODO: implement an old api route to do this search with string distance as param.
  // to not use so much data, lol. This is just temp.
  // In the nice long future with D1 as the data source, we'll fetch all comics here
  // and do the filtering here.

  const comicNames = await getAllComicNames();

  const similarComicNames = [];
  for (const comicName of comicNames) {
    const distance = stringDistance(newComicName, comicName);
    if (
      (newComicName.length < 5 && distance < 2) ||
      (newComicName.length >= 5 && distance < 3) ||
      (newComicName.length >= 14 && distance < 4)
    ) {
      similarComicNames.push(comicName);
    }
  }

  return json(similarComicNames);
};

async function getAllComicNames(): Promise<string[]> {
  const comicsRes = await fetch('https://yiffer.xyz/api/all-comics');
  const comics: ComicNameStruct[] = await comicsRes.json();
  return comics.map(comic => comic.name);
}
