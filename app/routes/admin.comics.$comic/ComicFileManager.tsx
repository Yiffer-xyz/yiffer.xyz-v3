import { FaRegFile } from 'react-icons/fa';
import type { Comic } from '~/types/types';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import { useGoodFetcher } from '~/utils/useGoodFetcher';

export default function ComicFileManager({
  comic,
  blockActions,
}: {
  comic: Comic;
  blockActions?: boolean;
}) {
  const listFilesFetcher = useGoodFetcher<{ key: string; size: number }[]>({
    url: '/api/admin/list-comic-files',
    method: 'post',
    toastError: true,
  });

  async function onFetch() {
    const formData = new FormData();
    formData.append('comicName', comic.name);
    listFilesFetcher.submit(formData);
  }

  return (
    <>
      <LoadingButton
        text="Fetch comic files"
        className="mt-1"
        onClick={onFetch}
        startIcon={FaRegFile}
        isLoading={listFilesFetcher.isLoading}
        disabled={blockActions}
      />

      {listFilesFetcher.data && (
        <div className="mt-2">
          {listFilesFetcher.data.map(file => (
            <p className="text-sm" key={file.key}>
              {file.key}
            </p>
          ))}
        </div>
      )}
    </>
  );
}
