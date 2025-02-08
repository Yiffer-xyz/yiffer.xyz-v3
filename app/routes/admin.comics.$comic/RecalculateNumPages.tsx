import { useState } from 'react';
import { LuRefreshCcw } from 'react-icons/lu';
import type { Comic } from '~/types/types';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import { useUIPreferences } from '~/utils/theme-provider';
import { showErrorToast, showSuccessToast, useGoodFetcher } from '~/utils/useGoodFetcher';
import type { ComicDataChanges } from './LiveComic';

export default function RecalculateNumPages({
  comic,
  imagesServerUrl,
  blockActions,
}: {
  comic: Comic;
  imagesServerUrl: string;
  blockActions?: boolean;
}) {
  const { theme } = useUIPreferences();
  const [isLoading, setIsLoading] = useState(false);

  const updateComicFetcher = useGoodFetcher({
    url: '/api/admin/update-comic-data',
    method: 'post',
  });

  async function onSubmit() {
    setIsLoading(true);

    const res = await fetch(`${imagesServerUrl}/recalculate-pages`, {
      body: JSON.stringify({ comicName: comic.name }),
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      showErrorToast('Error recalculating pages', theme);
      setIsLoading(false);
      return;
    }

    const json: any = await res.json();
    const { wasChanged, numPages }: { wasChanged: boolean; numPages: number } = json;
    const shouldChangeNumPages = numPages !== comic.numberOfPages;

    if (!wasChanged && !shouldChangeNumPages) {
      setIsLoading(false);
      showSuccessToast(
        "No changes necessary, comic seems correct. Message admin if it's not.",
        false,
        theme
      );
      return;
    }
    if (wasChanged && !shouldChangeNumPages) {
      setIsLoading(false);
      showSuccessToast(
        'Pages rearranged, num pages unchanged. Message admin if this is wrong.',
        false,
        theme
      );
      return;
    }

    const changes: ComicDataChanges = {
      comicId: comic.id,
      numberOfPages: numPages,
    };
    await updateComicFetcher.awaitSubmit({
      body: JSON.stringify(changes),
    });

    setIsLoading(false);
    showSuccessToast('Successfully updated pages.', false, theme);
  }

  return (
    <>
      <LoadingButton
        text="Recalculate/fix pages"
        className="mt-1"
        onClick={onSubmit}
        startIcon={LuRefreshCcw}
        isLoading={isLoading || updateComicFetcher.isLoading}
        disabled={blockActions}
      />
      {(isLoading || updateComicFetcher.isLoading) && (
        <p className="text-sm">
          For large comics, this might take a while, patience please 🙏
        </p>
      )}
    </>
  );
}
