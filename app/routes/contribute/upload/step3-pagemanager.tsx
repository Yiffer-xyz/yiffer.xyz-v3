import { NewComicData } from '.';
import { useState } from 'react';
import useWindowSize from '~/utils/useWindowSize';
import { getFilesWithBase64 } from '~/utils/general';
import PageManager from '~/components/PageManager/PageManager';
import Button from '~/components/Buttons/Button';
import { MdClear } from 'react-icons/md';

type Step3Props = {
  comicData: NewComicData;
  onUpdate: (newData: NewComicData) => void;
};

export default function Step3Pagemanager({ comicData, onUpdate }: Step3Props) {
  const { isMobile } = useWindowSize();
  const [isClearingPages, setIsClearingPages] = useState(false);
  const [isLoadingFileContents, setIsLoadingFileContents] = useState(false);

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      setIsLoadingFileContents(true);
      const filesWithString = await getFilesWithBase64(event.target.files);
      setIsLoadingFileContents(false);
      onUpdate({ ...comicData, files: filesWithString });
    }
  }

  return (
    <>
      <h4 className="mt-8">Pages</h4>

      {comicData.files.length === 0 && (
        <input type="file" onChange={onFileChange} multiple accept="image/*" />
      )}

      {(comicData.files.length > 0 || isLoadingFileContents) && (
        <p className="mb-2">
          {isMobile ? 'Tap' : 'Click'} an image to see it full size. Make sure the pages
          are correctly ordered.
        </p>
      )}

      {isLoadingFileContents && <p>Processing files...</p>}

      {comicData.files.length > 0 && (
        <>
          <PageManager
            files={comicData.files}
            onChange={newFiles => onUpdate({ ...comicData, files: newFiles })}
          />

          {!isClearingPages && (
            <Button
              variant="outlined"
              text="Clear pages"
              onClick={() => setIsClearingPages(true)}
              startIcon={MdClear}
              className="mt-2"
            />
          )}
          {isClearingPages && (
            <div className="flex flex-row gap-2 mt-2">
              <Button
                variant="outlined"
                onClick={() => setIsClearingPages(false)}
                text="Cancel"
                startIcon={MdClear}
              />
              <Button
                text="Clear pages"
                color="error"
                onClick={() => {
                  onUpdate({ ...comicData, files: [] });
                  setIsClearingPages(false);
                }}
                startIcon={MdClear}
              />
            </div>
          )}
        </>
      )}
    </>
  );
}
