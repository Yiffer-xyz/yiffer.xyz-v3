import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { getComicByField } from '~/route-funcs/get-comic';
import { processApiError } from '~/utils/request-helpers';
import ComicInfo from './ComicInfo';
import { authLoader } from '~/utils/loaders';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import TagElement from '~/ui-components/TagElement/TagElement';
import Link from '~/ui-components/Link';
import ComicStats from './ComicStats';
import ComicManageTags from './ComicManageTags';
import DropdownButton from '~/ui-components/Buttons/DropdownButton';
import { useState } from 'react';
import { padPageNumber } from '~/utils/general';
import ComicReportProblem from './ComicReportProblem';

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
      isLoggedIn: !!user,
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
  const [isManagingTags, setIsManagingTags] = useState(false);
  const [isReportingProblem, setIsReportingProblem] = useState(false);

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
    <div className="p-5 pt-2">
      <div>
        <h1 className="text-3xl">{comic.name}</h1>
        <p className="mt-1">
          by{' '}
          <Link
            href={`/artist/${comic.artist.name}`}
            text={comic.artist.name}
            isInsideParagraph
          />
        </p>
      </div>

      <div className="flex flex-row">
        <div className="flex flex-col">
          <ComicInfo
            comic={comic}
            updateStars={updateStars}
            toggleBookmark={toggleBookmark}
            isLoggedIn={isLoggedIn}
          />

          <div className="flex flex-row flex-wrap gap-1.5 mt-4">
            {comic.tags.map(tag => (
              <TagElement tag={tag} key={tag.id} disableHoverEffects />
            ))}
          </div>
        </div>

        <ComicStats comic={comic} />
      </div>

      {!isManagingTags && !isReportingProblem && (
        <DropdownButton
          text="Contribute"
          style={{ width: 140 }}
          className="mt-4"
          options={[
            { text: 'Add or remove tags', onClick: () => setIsManagingTags(true) },
            { text: 'Report problem', onClick: () => setIsReportingProblem(true) },
          ]}
        />
      )}

      {isManagingTags && (
        <ComicManageTags
          comic={comic}
          setIsManagingTags={setIsManagingTags}
          isLoggedIn={isLoggedIn}
        />
      )}

      {isReportingProblem && (
        <ComicReportProblem
          comic={comic}
          setIsReportingProblem={setIsReportingProblem}
          isLoggedIn={isLoggedIn}
        />
      )}

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
