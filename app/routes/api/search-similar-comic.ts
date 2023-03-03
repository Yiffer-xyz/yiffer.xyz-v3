import { ActionFunction, json } from '@remix-run/cloudflare';
import { getSimilarComics } from './funcs/get-similar-comics';

export interface SimilarComicResponse {
  similarComics: string[];
  exactMatchComic?: string;
  similarRejectedComics: string[];
  exactMatchRejectedComic?: string;
}

export const action: ActionFunction = async function ({ request, context }) {
  const urlBase = context.URL_BASE_V2 as string;
  const body = await request.formData();
  const comicName = body.get('comicName') as string;

  const data = await getSimilarComics(urlBase, comicName);
  return json(data);
};
