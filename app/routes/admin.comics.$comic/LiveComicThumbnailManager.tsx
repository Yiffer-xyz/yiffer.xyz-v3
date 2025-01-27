import { useRef, useState } from 'react';
import { MdArrowForward, MdClose, MdOpenInNew } from 'react-icons/md';
import Button from '~/ui-components/Buttons/Button';
import FileInput from '~/ui-components/FileInput';
import Select from '~/ui-components/Select/Select';
import ThumbnailCropper from '~/page-components/ThumbnailCropper/ThumbnailCropper';
import type { ComicImage } from '~/utils/general';
import { getFileWithBase64, padPageNumber, randomString } from '~/utils/general';
import type { Comic } from '~/types/types';
import '~/utils/cropper.min.css';
import { showErrorToast, showSuccessToast, useGoodFetcher } from '~/utils/useGoodFetcher';
import { useUIPreferences } from '~/utils/theme-provider';
import Link from '~/ui-components/Link';

type Props = {
  comicData: Comic;
  blockActions?: boolean;
  PAGES_PATH: string;
  IMAGES_SERVER_URL: string;
};

export default function LiveComicThumbnailManager({
  comicData,
  PAGES_PATH,
  IMAGES_SERVER_URL,
  blockActions,
}: Props) {
  const { theme } = useUIPreferences();
  const [randomQueryStr, setRandomQueryStr] = useState(randomString(3));

  const [isChanging, setIsChanging] = useState(false);
  const [fileToCrop, setFileToCrop] = useState<ComicImage | undefined>();
  const [isSelectingPageNum, setIsSelectingPageNum] = useState(false);
  const [tempSelectedPageNum, setTempSelectedPageNum] = useState<number>(1);
  const [pageNumForCrop, setPageNumForCrop] = useState<number | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateComicFetcher = useGoodFetcher({
    url: '/api/update-thumbnail-status',
    method: 'post',
    toastError: true,
  });

  function cancelChanges() {
    setTempSelectedPageNum(1);
    setIsSelectingPageNum(false);
    setPageNumForCrop(undefined);
    setIsChanging(false);
    setFileToCrop(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function submitNewThumbnail(croppedThumb: ComicImage) {
    setIsSubmitting(true);
    if (!croppedThumb.file) return;

    const formData = new FormData();
    formData.append('thumbnail', croppedThumb.file);
    formData.append('comicName', comicData.name);

    const res = await fetch(`${IMAGES_SERVER_URL}/change-thumbnail`, {
      method: 'POST',
      body: formData,
    });

    setIsSubmitting(false);
    if (res.ok) {
      showSuccessToast('Changed thumbnail', false, theme);
      setRandomQueryStr(randomString(3));
      cancelChanges();

      updateComicFetcher.submit({ comicId: comicData.id });
    } else {
      const resText = await res.text();
      showErrorToast('Error changing thumbnail: ' + resText, theme);
    }
  }

  async function onThumbnailFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (files && files.length) {
      const fileStr = await getFileWithBase64(files[0]);
      setFileToCrop(fileStr);
    }
  }

  return (
    <>
      <img
        src={`${PAGES_PATH}/${comicData.name}/thumbnail-2x.webp?${randomQueryStr}`}
        width={140}
        alt="thumbnail"
        className={isChanging ? 'opacity-50' : ''}
      />
      {!isChanging && (
        <Button
          text="Change thumbnail"
          onClick={() => setIsChanging(true)}
          className="mt-2"
          disabled={blockActions}
        />
      )}

      {isChanging && (
        <>
          <div className="mt-1">
            <Link
              href="/thumbnail-guidelines"
              text="Thumbnail guidelines"
              newTab
              IconRight={MdOpenInNew}
            />
          </div>

          {!isSelectingPageNum && (
            <div className="flex flex-row gap-2 flex-wrap mt-2">
              <Button
                text="Crop page 1"
                onClick={() => {
                  setPageNumForCrop(1);
                }}
              />
              <Button
                text="Crop another page"
                onClick={() => {
                  setIsSelectingPageNum(true);
                  setTempSelectedPageNum(1);
                }}
              />
              <FileInput
                onChange={onThumbnailFileUpload}
                ref={fileInputRef}
                accept="image/*"
              />
            </div>
          )}

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
                options={Array.from({ length: comicData.numberOfPages }).map((_, i) => ({
                  text: `Page ${i + 1}`,
                  value: i + 1,
                }))}
              />

              {tempSelectedPageNum && (
                <>
                  <img
                    src={`${PAGES_PATH}/${comicData.name}/${padPageNumber(tempSelectedPageNum)}.jpg`}
                    className="mt-2"
                    width={100}
                    alt=""
                  />
                  <Button
                    onClick={() => setPageNumForCrop(tempSelectedPageNum)}
                    text="Crop"
                    className="mt-1"
                    style={{ width: 100 }}
                    endIcon={MdArrowForward}
                  />
                </>
              )}
            </>
          )}

          {(pageNumForCrop || fileToCrop) && (
            <ThumbnailCropper
              minHeight={678}
              minWidth={480}
              image={
                fileToCrop || {
                  url: `${PAGES_PATH}/${comicData.name}/${padPageNumber(pageNumForCrop!)}.jpg`,
                }
              }
              onComplete={submitNewThumbnail}
              onClose={cancelChanges}
              isLoading={isSubmitting}
            />
          )}
        </>
      )}

      {isChanging && (
        <Button
          text="Cancel thumbnail change"
          variant="outlined"
          onClick={cancelChanges}
          className="mt-2"
          startIcon={MdClose}
        />
      )}
    </>
  );
}
