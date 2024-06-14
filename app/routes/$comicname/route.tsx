import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { getComicByField } from '~/route-funcs/get-comic';
import { padPageNumber } from '~/utils/general';
import { processApiError } from '~/utils/request-helpers';
import ComicInfo from './ComicInfo';
import { authLoader } from '~/utils/loaders';
import { useGoodFetcher } from '~/utils/useGoodFetcher';

export async function loader(args: LoaderFunctionArgs) {
  const user = await authLoader(args);

  const comic = await getComicByField({
    db: args.context.DB,
    fieldName: 'name',
    fieldValue: args.params.comicname as string,
    userId: user?.userId,
  });

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
    isLoggedIn: !!user,
  };
}

export default function ComicPage() {
  const { comic, notFound, pagesPath, isLoggedIn } = useLoaderData<typeof loader>();

  const updateYourStarsFetcher = useGoodFetcher({
    method: 'post',
    url: '/api/update-your-stars',
  });

  const toggleBookmarkFetcher = useGoodFetcher({
    method: 'post',
    url: '/api/toggle-bookmark',
  });

  function updateStars(stars: number) {
    updateYourStarsFetcher.submit({
      stars,
      comicId: comic!.id,
    });
  }

  function toggleBookmark() {
    toggleBookmarkFetcher.submit({
      comicId: comic!.id,
    });
  }

  if (notFound || !comic) {
    return <div>Comic not found</div>;
  }

  return (
    <div>
      <ComicInfo
        comic={comic}
        updateStars={updateStars}
        toggleBookmark={toggleBookmark}
        isLoggedIn={isLoggedIn}
      />

      <pre>{JSON.stringify(comic, null, 2)}</pre>

      <div className="flex flex-row gap-4 flex-wrap">
        {Array.from({ length: comic.numberOfPages }, (_, i) => (
          <img
            key={i}
            src={`${pagesPath}/${comic.name}/${padPageNumber(i + 1)}.jpg`}
            alt={`Page ${i + 1}`}
            className="max-w-[200px] sm:max-w-[500px]"
          />
        ))}
      </div>
    </div>
  );
}
