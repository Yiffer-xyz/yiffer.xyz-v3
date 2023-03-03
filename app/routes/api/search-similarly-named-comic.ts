import { ActionFunction, json } from '@remix-run/cloudflare';
import { getSimilarlyNamedComics } from './funcs/get-similar-comics';

export interface SimilarComicResponse {
  similarComics: string[];
  exactMatchComic?: string;
  similarRejectedComics: string[];
  exactMatchRejectedComic?: string;
}

export const action: ActionFunction = async function ({ request, context }) {
  const urlBase = context.DB_API_URL_BASE as string;
  const body = await request.formData();
  const comicName = body.get('comicName') as string;

  const data = await getSimilarlyNamedComics(urlBase, comicName);
  return json(data);
};
