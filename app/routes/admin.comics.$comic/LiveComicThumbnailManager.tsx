import { useRef, useState } from 'react';
import { MdArrowForward, MdClose, MdOpenInNew } from 'react-icons/md';
import Button from '~/ui-components/Buttons/Button';
import FileInput from '~/ui-components/FileInput';
import Select from '~/ui-components/Select/Select';
import ThumbnailCropper from '~/page-components/ThumbnailCropper/ThumbnailCropper';
import type { ImageFileOrUrl } from '~/utils/general';
import { getFileExtension, getFileWithBase64, randomString } from '~/utils/general';
import type { Comic, ProcessFilesArgs } from '~/types/types';
import '~/utils/cropper.min.css';
import { showErrorToast, useGoodFetcher } from '~/utils/useGoodFetcher';
import { useUIPreferences } from '~/utils/theme-provider';
import Link from '~/ui-components/Link';
import { generateToken } from '~/utils/string-utils';
import { COMIC_CARD_BASE_HEIGHT, COMIC_CARD_BASE_WIDTH } from '~/types/constants';

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
  const [fileToCrop, setFileToCrop] = useState<ImageFileOrUrl | undefined>();
  const [isSelectingPageNum, setIsSelectingPageNum] = useState(false);
  const [tempSelectedPage, setTempSelectedPage] = useState<{
    token: string;
    pageNumber: number;
  }>(comicData.pages[0]);
  const [pageForCrop, setPageForCrop] = useState<
    | {
        token: string;
        pageNumber: number;
      }
    | undefined
  >();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateThumbnailFetcher = useGoodFetcher({
    url: '/api/update-thumbnail',
    method: 'post',
    toastSuccessMessage: 'Thumbnail updated',
    onFinish: () => {
      setIsSubmitting(false);
      setRandomQueryStr(randomString(3));
      cancelChanges();
    },
  });

  function cancelChanges() {
    setTempSelectedPage(comicData.pages[0]);
    setIsSelectingPageNum(false);
    setPageForCrop(undefined);
    setIsChanging(false);
    setFileToCrop(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function submitNewThumbnail(croppedThumb: ImageFileOrUrl) {
    if (!croppedThumb.file) return;
    setIsSubmitting(true);

    const thumbnailFormData = new FormData();
    const thumbnailTempToken = generateToken();
    thumbnailFormData.append(
      'files',
      croppedThumb.file,
      `${thumbnailTempToken}.${getFileExtension(croppedThumb.file.name)}`
    );
    const thumbnailProcessFilesArgs: ProcessFilesArgs = {
      formats: ['jpg', 'webp'],
      resizes: [
        {
          width: COMIC_CARD_BASE_WIDTH * 2,
          height: COMIC_CARD_BASE_HEIGHT * 2,
          suffix: '2x',
        },
        {
          width: COMIC_CARD_BASE_WIDTH * 3,
          height: COMIC_CARD_BASE_HEIGHT * 3,
          suffix: '3x',
        },
      ],
    };
    thumbnailFormData.append('argsJson', JSON.stringify(thumbnailProcessFilesArgs));

    try {
      const res = await fetch(`${IMAGES_SERVER_URL}/process-files`, {
        method: 'POST',
        body: thumbnailFormData,
      });

      if (!res.ok) {
        const resText = await res.text();
        showErrorToast('Error uploading file: ' + resText, theme);
      }
    } catch (e) {
      console.error(e);
      showErrorToast('Error changing thumbnail: ' + e?.toString(), theme);
    }

    updateThumbnailFetcher.submit({
      comicId: comicData.id,
      tempToken: thumbnailTempToken,
    });
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
        src={`${PAGES_PATH}/comics/${comicData.id}/thumbnail-2x.webp?${randomQueryStr}`}
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
                  setPageForCrop({
                    pageNumber: 1,
                    token: comicData.pages[0].token,
                  });
                }}
              />
              <Button
                text="Crop another page"
                onClick={() => {
                  setIsSelectingPageNum(true);
                  setTempSelectedPage(comicData.pages[0]);
                }}
              />
              <FileInput
                onChange={onThumbnailFileUpload}
                ref={fileInputRef}
                accept="image/*"
                disabled
              />
            </div>
          )}

          {/* Existing page selector  */}
          {isSelectingPageNum && (
            <>
              <Select
                value={tempSelectedPage}
                onChange={newNum => setTempSelectedPage(newNum)}
                name="pageFileToCropNumber"
                minWidth={150}
                title="Page to crop from"
                className="mt-3"
                options={comicData.pages.map(page => ({
                  text: `Page ${page.pageNumber}`,
                  value: page,
                }))}
              />

              {tempSelectedPage && (
                <>
                  <img
                    src={`${PAGES_PATH}/comics/${comicData.id}/${tempSelectedPage.token}.jpg`}
                    className="mt-2"
                    width={100}
                    alt=""
                  />
                  <Button
                    onClick={() => setPageForCrop(tempSelectedPage)}
                    text="Crop"
                    className="mt-1"
                    style={{ width: 100 }}
                    endIcon={MdArrowForward}
                  />
                </>
              )}
            </>
          )}

          {(pageForCrop || fileToCrop) && (
            <ThumbnailCropper
              title="Crop thumbnail"
              mode="modal"
              minHeight={678}
              minWidth={480}
              image={
                fileToCrop || {
                  url: `${PAGES_PATH}/comics/${comicData.id}/${pageForCrop!.token}.jpg`,
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
