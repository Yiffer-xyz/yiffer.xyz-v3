import { useCallback, useEffect, useRef, useState } from 'react';
import { MdArrowForward } from 'react-icons/md';
import Button from '~/ui-components/Buttons/Button';
import FileInput from '~/ui-components/FileInput';
import RadioButtonGroup from '~/ui-components/RadioButton/RadioButtonGroup';
import Select from '~/ui-components/Select/Select';
import ThumbnailCropper from '~/page-components/ThumbnailCropper/ThumbnailCropper';
import type { ComicImage } from '~/utils/general';
import { getFileWithBase64 } from '~/utils/general';
import type { NewComicData } from './route';

type Step4Props = {
  comicData: NewComicData;
  onUpdate: (newData: NewComicData) => void;
};

export default function Step4Thumbnail({ comicData, onUpdate }: Step4Props) {
  const [fileToCrop, setFileToCrop] = useState<ComicImage | undefined>(undefined);
  const [thumbnailMode, setThumbnailMode] = useState<'upload' | 'page-file' | 'page-1'>(
    'page-1'
  );
  const [pageFileToCropNumber, setPageFileToCropNumber] = useState<number>(1);
  const [pageFileToCrop, setPageFileToCrop] = useState<ComicImage | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function onThumbnailFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (files && files.length) {
      const fileStr = await getFileWithBase64(files[0]);
      setFileToCrop(fileStr);
    }
  }

  const onPageFileNumChange = useCallback(
    (newNum: number) => {
      setPageFileToCropNumber(newNum);
      if (!comicData.files) {
        setPageFileToCrop(undefined);
      } else {
        const file = comicData.files[newNum - 1];
        setPageFileToCrop(file);
      }
    },
    [comicData.files]
  );

  function onCropFinished(croppedThumb: ComicImage) {
    onUpdate({
      ...comicData,
      thumbnail: croppedThumb,
    });
  }

  function onCancelCrop() {
    setFileToCrop(undefined);
    setPageFileToCropNumber(1);
    setPageFileToCrop(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  useEffect(() => {
    if (thumbnailMode === 'page-file' && comicData.files) {
      onPageFileNumChange(1);
    }
    if (thumbnailMode === 'page-1' && comicData.files) {
      setFileToCrop(comicData.files[0]);
    }
  }, [comicData.files, onPageFileNumChange, thumbnailMode]);

  return (
    <>
      <h4 className="mt-8">Thumbnail</h4>

      {/* Completed crop */}
      {comicData.thumbnail && (
        <>
          <img src={comicData.thumbnail.base64} width={120} alt="thumbnail" />
          <Button
            text="Change"
            onClick={() => {
              onCancelCrop();
              onUpdate({ ...comicData, thumbnail: undefined });
            }}
            variant="outlined"
            className="mt-1"
            style={{ width: 120 }}
          />
        </>
      )}

      {/* Not completed crop */}
      {!comicData.thumbnail && (
        <>
          <RadioButtonGroup
            name="thumbnailMode"
            onChange={newMode => {
              setThumbnailMode(newMode as 'upload' | 'page-file');
              if (newMode === 'page-file') {
                onPageFileNumChange(1);
              }
              if (newMode === 'page-1') {
                setFileToCrop(comicData.files[0]);
              }
            }}
            value={thumbnailMode}
            className="my-2"
            options={[
              { text: 'Crop page 1', value: 'page-1' },
              { text: 'Crop another page', value: 'page-file' },
              { text: 'Upload a file', value: 'upload' },
            ]}
          />

          {thumbnailMode === 'upload' && (
            <FileInput
              onChange={onThumbnailFileUpload}
              ref={fileInputRef}
              accept="image/*"
            />
          )}

          {thumbnailMode === 'page-file' && (
            <>
              {comicData.files.length > 0 ? (
                <>
                  <Select
                    value={pageFileToCropNumber}
                    onChange={newNum => onPageFileNumChange(newNum)}
                    name="pageFileToCropNumber"
                    minWidth={150}
                    title="Page to crop from"
                    className="mt-3"
                    options={comicData.files.map((file, i) => ({
                      text: `Page ${i + 1}`,
                      value: i + 1,
                    }))}
                  />

                  {pageFileToCrop && (
                    <>
                      <img
                        src={pageFileToCrop.base64}
                        className="mt-2"
                        width={100}
                        alt=""
                      />
                      <Button
                        onClick={() => setFileToCrop(pageFileToCrop)}
                        text="Crop"
                        className="mt-1"
                        style={{ width: 100 }}
                        endIcon={MdArrowForward}
                      />
                    </>
                  )}
                </>
              ) : (
                <p>No pages uploaded yet.</p>
              )}
            </>
          )}

          {fileToCrop && (
            <ThumbnailCropper
              minHeight={678}
              minWidth={480}
              image={fileToCrop}
              onComplete={onCropFinished}
              onClose={onCancelCrop}
            />
          )}
        </>
      )}
    </>
  );
}
