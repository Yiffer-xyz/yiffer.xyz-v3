import type { Comic } from '~/types/types';
import type { ActionFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';

type SimilarComicsList = {
  similarComics: Array<Comic>;
  exactMatchComic: string | null;
  similarRejectedComics: Array<Comic>;
  exactMatchRejectedComic: string | null;
};

export const action: ActionFunction = async function ({ request, context }) {
  const urlBase = context.URL_BASE as string;
  const body = await request.formData();
  const comicName = body.get('comicName') as string;

  if (!comicName) return json([]);

  const similarComics = await getSimilarComics(urlBase, comicName);

  if (similarComics.exactMatchComic) {
    return json({ suggestedComics: [similarComics.exactMatchComic] });
  } else if (similarComics.exactMatchRejectedComic) {
    return json({ suggestedComics: [similarComics.exactMatchRejectedComic] });
  } else if (similarComics.similarComics.length > 0) {
    return json({ suggestedComics: similarComics.similarComics });
  } else if (similarComics.similarRejectedComics.length > 0) {
    return json({ suggestedComics: similarComics.similarRejectedComics });
  }

  return json({ suggestedComics: [] });
};

async function getSimilarComics(
  urlBase: string,
  comicName: string
): Promise<SimilarComicsList> {
  const response = await fetch(`${urlBase}/api/similar-comics?comicName=${comicName}`);

  const similarComics: SimilarComicsList = await response.json();

  return similarComics;
}
