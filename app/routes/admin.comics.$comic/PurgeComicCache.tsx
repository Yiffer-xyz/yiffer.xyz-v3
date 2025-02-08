import { useState } from 'react';
import { PiBroomBold } from 'react-icons/pi';
import type { Comic } from '~/types/types';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import { useUIPreferences } from '~/utils/theme-provider';
import { showErrorToast, showSuccessToast } from '~/utils/useGoodFetcher';

export default function PurgeComicCache({
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

  async function onSubmit() {
    setIsLoading(true);
    const res = await fetch(`${imagesServerUrl}/purge-comic-cache`, {
      body: JSON.stringify({ comicName: comic.name, numberOfPages: comic.numberOfPages }),
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
    });
    setIsLoading(false);

    if (!res.ok) {
      showErrorToast('Error purging cache', theme);
      return;
    }

    showSuccessToast('Cache purged', false, theme);
  }

  return (
    <>
      <LoadingButton
        text="Purge cache"
        className="mt-1"
        onClick={onSubmit}
        startIcon={PiBroomBold}
        isLoading={isLoading}
        disabled={blockActions}
      />
    </>
  );
}
