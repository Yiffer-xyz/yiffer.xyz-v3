import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { getComicByField } from '~/route-funcs/get-comic';
import { processApiError } from '~/utils/request-helpers';

export async function loader(args: LoaderFunctionArgs) {
  const comic = await getComicByField(
    args.context.DB_API_URL_BASE,
    'name',
    args.params.comicname as string,
    true
  );

  if (comic.err) {
    return processApiError('Error getting comic', comic.err);
  }

  if (comic.notFound) {
    return {
      comic: null,
      notFound: true,
    };
  }

  return {
    comic: comic.result,
    notFound: false,
  };
}

export default function ComicPage() {
  const { comic, notFound } = useLoaderData<typeof loader>();

  if (notFound || !comic) {
    return <div>Comic not found</div>;
  }

  return (
    <div>
      <h1>{comic.name}</h1>
      <pre>{JSON.stringify(comic, null, 2)}</pre>
    </div>
  );
}
