import { ActionFunction, json } from '@remix-run/cloudflare';

export interface SimilarComicResponse {
  similarComics: string[];
  exactMatchComic?: string;
  similarRejectedComics: string[];
  exactMatchRejectedComic?: string;
}

export const action: ActionFunction = async function ({ request, context }) {
  const urlBase = context.URL_BASE as string;
  const body = await request.formData();
  const comicName = body.get('comicName') as string;

  const data = await getSimilarComics(comicName, urlBase);
  return json(data);
};

async function getSimilarComics(comicName: string, urlBase: string): Promise<SimilarComicResponse> {
  const comicsRes = await fetch(`${urlBase}/api/similar-comics?comicName=${comicName}`);
  const comics: SimilarComicResponse = await comicsRes.json();
  return comics;
}
