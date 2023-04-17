import { useEffect, useRef, useState } from 'react';
import { MdArrowForward } from 'react-icons/md';
import Button from '~/components/Buttons/Button';
import FileInput from '~/components/FileInput';
import RadioButtonGroup from '~/components/RadioButton/RadioButtonGroup';
import Select from '~/components/Select/Select';
import ThumbnailCropper from '~/components/ThumbnailCropper/ThumbnailCropper';
import { ComicImage, getFileWithBase64 } from '~/utils/general';
import { NewComicData } from '.';

type Step4Props = {
  comicData: NewComicData;
  onUpdate: (newData: NewComicData) => void;
};

export default function Step4Thumbnail({ comicData, onUpdate }: Step4Props) {
  const [fileToCrop, setFileToCrop] = useState<ComicImage | undefined>(undefined);
  const [thumbnailMode, setThumbnailMode] = useState<'upload' | 'page-file'>('upload');
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

  async function onPageFileNumChange(newNum: number) {
    setPageFileToCropNumber(newNum);
    if (!comicData.files) {
      setPageFileToCrop(undefined);
    } else {
      const file = comicData.files[newNum - 1];
      setPageFileToCrop(file);
    }
  }

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
  }, [comicData.files]);

  return (
    <>
      <h4 className="mt-8">Thumbnail</h4>

      {/* Completed crop */}
      {comicData.thumbnail && (
        <>
          <img src={comicData.thumbnail.base64} width={120} />
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
            }}
            value={thumbnailMode}
            className="my-2"
            options={[
              { text: 'Upload a file', value: 'upload' },
              { text: "Crop an image from the comic's pages", value: 'page-file' },
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
                      <img src={pageFileToCrop.base64} className="mt-2" width={100} />
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
