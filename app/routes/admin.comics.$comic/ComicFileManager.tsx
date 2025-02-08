import { useState } from 'react';
import { FaPen, FaRegFile, FaTrash } from 'react-icons/fa';
import type { Comic } from '~/types/types';
import Button from '~/ui-components/Buttons/Button';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import TextInput from '~/ui-components/TextInput/TextInput';
import { useGoodFetcher } from '~/utils/useGoodFetcher';

export default function ComicFileManager({
  comic,
  imagesServerUrl,
  blockActions,
}: {
  comic: Comic;
  imagesServerUrl: string;
  blockActions?: boolean;
}) {
  const [action, setAction] = useState<'filename-replace' | 'delete-files' | null>(null);
  const [replaceFrom, setReplaceFrom] = useState('');
  const [replaceTo, setReplaceTo] = useState('');

  const listFilesFetcher = useGoodFetcher<{ key: string; size: number }[]>({
    url: '/api/admin/list-comic-files',
    method: 'post',
    toastError: true,
  });

  const replaceFilesFetcher = useGoodFetcher({
    url: '/api/admin/rename-comic-files',
    method: 'post',
    toastError: true,
    toastSuccessMessage: 'Files renamed successfully',
  });

  async function onFetch() {
    const formData = new FormData();
    formData.append('comicName', comic.name);
    listFilesFetcher.submit(formData);
  }

  async function onReplace() {
    const formData = new FormData();
    formData.append('comicName', comic.name);
    formData.append('replaceFrom', replaceFrom);
    formData.append('replaceTo', replaceTo);
    await replaceFilesFetcher.awaitSubmit(formData);
    setAction(null);
    onFetch();
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
          <p className="font-semibold">Files found</p>
          <p className="text-sm">
            Normally, files should start from 0001, and there should be a jpg and webp
            version of each page.
          </p>
          <p className="text-sm">
            There should also be thumbnail-2x.jpg, thumbnail-2x.webp, and their 3x
            equivalents.
          </p>
          {listFilesFetcher.data.map(file => (
            <p className="text-sm" key={file.key}>
              {file.key}
            </p>
          ))}

          {action === null && (
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                text="Filename replace"
                variant="outlined"
                onClick={() => setAction('filename-replace')}
                startIcon={FaPen}
              />
              <Button
                text="Select files to delete (coming soon)"
                variant="outlined"
                color="error"
                disabled
                onClick={() => setAction('delete-files')}
                startIcon={FaTrash}
              />
            </div>
          )}

          {action === 'filename-replace' && (
            <div className="mt-2">
              <p className="font-semibold">Replace filename</p>
              <p className="text-sm">
                Replace any text across all filenames, just like in a text editor.
              </p>

              <div className="mt-2">
                <TextInput
                  value={replaceFrom}
                  onChange={setReplaceFrom}
                  placeholder="Example: -temp"
                  className="w-full md:w-[300px] mt-2"
                  label="Replace..."
                />
                <TextInput
                  value={replaceTo}
                  onChange={setReplaceTo}
                  placeholder="Leave empty to remove text"
                  className="w-full md:w-[300px] mt-4"
                  label="With..."
                />
              </div>

              <div className="flex flex-row gap-2 mt-4">
                <Button
                  text="Cancel"
                  variant="outlined"
                  onClick={() => setAction(null)}
                />
                <LoadingButton
                  text="Replace"
                  variant="contained"
                  onClick={onReplace}
                  isLoading={replaceFilesFetcher.isLoading}
                  disabled={replaceFrom.length === 0}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
