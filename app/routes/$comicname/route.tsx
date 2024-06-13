import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { getComicByField } from '~/route-funcs/get-comic';
import { padPageNumber } from '~/utils/general';
import { processApiError } from '~/utils/request-helpers';

export async function loader(args: LoaderFunctionArgs) {
  const comic = await getComicByField(
    args.context.DB,
    'name',
    args.params.comicname as string,
    true
  );

  if (comic.err) {
    return processApiError('Error getting comic in /comic', comic.err);
  }

  if (comic.notFound) {
    return {
      comic: null,
      notFound: true,
      pagesPath: args.context.PAGES_PATH,
    };
  }

  return {
    comic: comic.result,
    notFound: false,
    pagesPath: args.context.PAGES_PATH,
  };
}

export default function ComicPage() {
  const { comic, notFound, pagesPath } = useLoaderData<typeof loader>();

  if (notFound || !comic) {
    return <div>Comic not found</div>;
  }

  return (
    <div>
      <h1>{comic.name}</h1>
      <pre>{JSON.stringify(comic, null, 2)}</pre>

      <div className="flex flex-row gap-4 flex-wrap">
        {Array.from({ length: comic.numberOfPages }, (_, i) => (
          <img
            key={i}
            src={`${pagesPath}/${comic.name}/${padPageNumber(i + 1)}.jpg`}
            alt={`Page ${i + 1}`}
            style={{ maxWidth: 500 }}
          />
        ))}
      </div>
    </div>
  );
}
