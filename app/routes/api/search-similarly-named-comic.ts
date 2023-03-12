import { ActionArgs, json } from '@remix-run/cloudflare';
import { getSimilarlyNamedComics } from './funcs/get-similar-comics';

export type SimilarComicResponse = {
  similarComics: string[];
  exactMatchComic?: string;
  similarRejectedComics: string[];
  exactMatchRejectedComic?: string;
};

export async function action(args: ActionArgs) {
  const urlBase = args.context.DB_API_URL_BASE as string;
  const body = await args.request.formData();
  const comicName = body.get('comicName') as string;
  const excludeName = body.get('excludeName');

  const data = await getSimilarlyNamedComics(
    urlBase,
    comicName,
    excludeName ? excludeName.toString() : undefined
  );
  return json(data);
}
