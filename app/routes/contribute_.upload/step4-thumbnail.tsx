import { useRef, useState } from 'react';
import { MdArrowForward, MdOpenInNew } from 'react-icons/md';
import Button from '~/ui-components/Buttons/Button';
import FileInput from '~/ui-components/FileInput';
import Select from '~/ui-components/Select/Select';
import ThumbnailCropper from '~/page-components/ThumbnailCropper/ThumbnailCropper';
import type { ComicImage } from '~/utils/general';
import { getFileWithBase64 } from '~/utils/general';
import type { NewComicData } from './route';
import Link from '~/ui-components/Link';

type Step4Props = {
  comicData: NewComicData;
  onUpdate: (newData: NewComicData) => void;
};

export default function Step4Thumbnail({ comicData, onUpdate }: Step4Props) {
  const [fileToCrop, setFileToCrop] = useState<ComicImage | undefined>(undefined);
  const [isSelectingPageNum, setIsSelectingPageNum] = useState(false);
  const [tempSelectedPageNum, setTempSelectedPageNum] = useState<number>(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function onThumbnailFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (files && files.length) {
      const fileStr = await getFileWithBase64(files[0]);
      setFileToCrop(fileStr);
    }
  }

  function onCropFinished(croppedThumb: ComicImage) {
    setIsSelectingPageNum(false);
    setTempSelectedPageNum(1);
    onUpdate({
      ...comicData,
      thumbnail: croppedThumb,
    });
  }

  function onCancelCrop() {
    setFileToCrop(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  return (
    <>
      <h4 className="mt-8">Thumbnail</h4>

      <div className="mb-1">
        <Link
          href="/thumbnail-guidelines"
          text="Thumbnail guidelines - please read"
          newTab
          IconRight={MdOpenInNew}
        />
      </div>

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
          <div className="flex flex-row gap-2 flex-wrap mt-1">
            <Button
              text="Crop page 1"
              onClick={() => {
                setFileToCrop(comicData.files?.[0]);
              }}
              disabled={!comicData.files?.length}
            />
            <Button
              text="Crop another page"
              onClick={() => {
                setIsSelectingPageNum(true);
              }}
              disabled={!comicData.files?.length}
            />
            <FileInput
              onChange={onThumbnailFileUpload}
              ref={fileInputRef}
              accept="image/*"
            />
          </div>

          {/* Existing page selector  */}
          {isSelectingPageNum && (
            <>
              <Select
                value={tempSelectedPageNum}
                onChange={newNum => setTempSelectedPageNum(newNum)}
                name="pageFileToCropNumber"
                minWidth={150}
                title="Page to crop from"
                className="mt-3"
                options={Array.from({ length: comicData.files?.length ?? 1 }).map(
                  (_, i) => ({
                    text: `Page ${i + 1}`,
                    value: i + 1,
                  })
                )}
              />

              {tempSelectedPageNum && (
                <>
                  <img
                    src={comicData.files?.[tempSelectedPageNum - 1].base64}
                    className="mt-2"
                    width={100}
                    alt=""
                  />
                  <Button
                    onClick={() =>
                      setFileToCrop(comicData.files?.[tempSelectedPageNum - 1])
                    }
                    text="Crop"
                    className="mt-1"
                    style={{ width: 100 }}
                    endIcon={MdArrowForward}
                  />
                </>
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
