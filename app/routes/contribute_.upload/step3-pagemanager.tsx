import type { NewComicData } from './route';
import { useState } from 'react';
import useWindowSize from '~/utils/useWindowSize';
import { getFilesWithBase64 } from '~/utils/general';
import PageManager from '~/page-components/PageManager/PageManager';
import Button from '~/ui-components/Buttons/Button';
import FileInput from '~/ui-components/FileInput';
import InfoBox from '~/ui-components/InfoBox';

type Step3Props = {
  comicData: NewComicData;
  onUpdate: (newData: NewComicData) => void;
  contentWidth: number;
};

export default function Step3Pagemanager({
  comicData,
  onUpdate,
  contentWidth,
}: Step3Props) {
  const { isMobile } = useWindowSize();
  const [isClearingPages, setIsClearingPages] = useState(false);
  const [isSortingPages, setIsSortingPages] = useState(false);
  const [isLoadingFileContents, setIsLoadingFileContents] = useState(false);
  const [duplicateFilenames, setDuplicateFilenames] = useState<string[]>([]);

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      setIsLoadingFileContents(true);
      const filesWithString = await getFilesWithBase64(event.target.files);
      setIsLoadingFileContents(false);

      const newDuplicateFilenames: string[] = [];
      // Check for duplicate files
      for (const file of filesWithString) {
        if (!file.file?.name) continue;
        if (comicData.files.some(f => f.file?.name === file.file?.name)) {
          newDuplicateFilenames.push(file.file?.name);
        }
      }
      setDuplicateFilenames(newDuplicateFilenames);
      if (newDuplicateFilenames.length > 0) return;

      const newFiles = [...comicData.files, ...filesWithString];
      onUpdate({ ...comicData, files: newFiles });
    }
  }

  function onSortPagesByFilename() {
    const newFiles = comicData.files.sort((a, b) => {
      const nameA = a.file?.name?.toLowerCase();
      const nameB = b.file?.name?.toLowerCase();
      if (!nameA || !nameB) return 0;
      return nameA.localeCompare(nameB);
    });
    onUpdate({ ...comicData, files: newFiles });
    setIsSortingPages(false);
  }

  return (
    <>
      <h4 className="mt-8">Pages</h4>

      <FileInput onChange={onFileChange} multiple accept="image/*" />

      {duplicateFilenames.length > 0 && (
        <InfoBox
          variant="error"
          text="Some files have the same name as existing files. The latest selection was not added. Offending files:"
          boldText={false}
          className="my-2"
          fitWidth
        >
          <p>
            {duplicateFilenames.map((filename, i) => (
              <span key={filename}>
                {filename}
                {i < duplicateFilenames.length - 1 && ', '}
              </span>
            ))}
          </p>
          <Button
            variant="naked"
            className="!text-white -ml-3 -mb-2"
            text="Dismiss"
            onClick={() => {
              setDuplicateFilenames([]);
            }}
          />
        </InfoBox>
      )}

      {(comicData.files.length > 0 || isLoadingFileContents) && (
        <p className="my-2 text-sm">
          {isMobile ? 'Tap' : 'Click'} an image to see it full size. Make sure the pages
          are correctly ordered. You can add files in multiple batches as long as there
          are no duplicate file names.
        </p>
      )}

      {isLoadingFileContents && <p>Processing files...</p>}

      {comicData.files.length > 0 && (
        <div className="mt-4">
          <PageManager
            files={comicData.files}
            onChange={newFiles => onUpdate({ ...comicData, files: newFiles })}
            pageManagerWidth={contentWidth}
            source="comic-upload"
          />

          <div className="flex flex-row gap-2">
            {!isClearingPages && !isSortingPages && (
              <>
                <Button
                  variant="outlined"
                  text="Clear pages"
                  onClick={() => setIsClearingPages(true)}
                />
                <Button
                  variant="outlined"
                  text="Sort pages by filename"
                  onClick={() => setIsSortingPages(true)}
                />
              </>
            )}
            {isClearingPages && (
              <>
                <Button
                  variant="outlined"
                  onClick={() => setIsClearingPages(false)}
                  text="Cancel, keep pages"
                />
                <Button
                  text="Clear pages"
                  color="error"
                  onClick={() => {
                    onUpdate({ ...comicData, files: [] });
                    setIsClearingPages(false);
                  }}
                />
              </>
            )}
            {isSortingPages && (
              <>
                <Button
                  variant="outlined"
                  text="Cancel"
                  onClick={() => setIsSortingPages(false)}
                />
                <Button
                  color="error"
                  text="Confirm sort by filename"
                  onClick={onSortPagesByFilename}
                />
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
