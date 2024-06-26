import { useRevalidator } from '@remix-run/react';
import { useEffect, useMemo, useState } from 'react';
import { IoMdTrash } from 'react-icons/io';
import { MdArrowForward } from 'react-icons/md';
import PageManager from '~/page-components/PageManager/PageManager';
import { MAX_UPLOAD_BODY_SIZE } from '~/types/constants';
import type { Comic } from '~/types/types';
import Button from '~/ui-components/Buttons/Button';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import FileInput from '~/ui-components/FileInput';
import InfoBox from '~/ui-components/InfoBox';
import type { ComicImage } from '~/utils/general';
import {
  generateRandomId,
  getFilesWithBase64,
  padPageNumber,
  pageNumberToPageName,
} from '~/utils/general';
import { useUIPreferences } from '~/utils/theme-provider';
import { showSuccessToast, useGoodFetcher } from '~/utils/useGoodFetcher';

type UpdatedComicPage = {
  previousPos?: number;
  newPos?: number;
  isDeleted: boolean;
};

type ManagePagesAdminProps = {
  comic: Comic;
  PAGES_PATH: string;
  IMAGES_SERVER_URL: string;
};

export default function ManagePagesAdmin({
  comic,
  PAGES_PATH,
  IMAGES_SERVER_URL,
}: ManagePagesAdminProps) {
  const { theme } = useUIPreferences();
  const revalidator = useRevalidator();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | undefined>();
  const [randomString, setRandomString] = useState<string>(generateRandomId());

  const [initialPages, setInitialPages] = useState<{ url: string }[]>(
    Array.from({ length: comic.numberOfPages }, (_, i) => ({
      url: pageNumToUrl(PAGES_PATH, comic.name, i + 1),
    }))
  );

  const [comicPages, setComicPages] = useState<ComicImage[]>(
    Array.from({ length: comic.numberOfPages }, (_, i) => ({
      url: pageNumToUrl(PAGES_PATH, comic.name, i + 1),
    }))
  );

  function resetComicPages() {
    const newInitialPages = Array.from({ length: comic.numberOfPages }, (_, i) => ({
      url: pageNumToUrl(PAGES_PATH, comic.name, i + 1),
    }));
    setComicPages(newInitialPages);
    setInitialPages(newInitialPages);
    setRandomString(generateRandomId());
  }

  useEffect(() => {
    resetComicPages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [PAGES_PATH, comic]);

  const { awaitSubmit: updateNumberOfPages } = useGoodFetcher({
    url: '/api/admin/update-comic-data',
    method: 'post',
  });

  async function submitPageChanges() {
    const pagesData: UpdatedComicPage[] = [];

    for (let i = 0; i < comicPages.length; i++) {
      const urlOfPageNum = pageNumToUrl(PAGES_PATH, comic.name, i + 1);
      const oldPos = initialPages.findIndex(p => p.url === urlOfPageNum);
      const newPos = comicPages.findIndex(p => p.url === urlOfPageNum);

      pagesData.push({
        previousPos: oldPos + 1,
        newPos: newPos === -1 ? undefined : newPos + 1,
        isDeleted: newPos === -1,
      });
    }

    const needsUpdateNumPages = comicPages.length !== comic.numberOfPages;

    if (needsUpdateNumPages) {
      await updateNumberOfPages({
        body: JSON.stringify({ comicId: comic.id, numberOfPages: comicPages.length }),
      });
    }

    const formData = new FormData();
    formData.append('comicName', comic.name.toString());
    formData.append('pagesData', JSON.stringify(pagesData));

    setIsSubmitting(true);

    const rearrangeRes = await fetch(`${IMAGES_SERVER_URL}/rearrange-comic`, {
      method: 'POST',
      body: formData,
    });
    if (!rearrangeRes.ok) {
      resetComicPages();
      return setUploadError('An error occurred while rearranging the comic pages.');
    }

    let isUploadError = false;
    const isUploading = comicPages.some(f => f.file);

    if (isUploading) {
      let currentFormData = new FormData();
      currentFormData.append('comicName', comic.name);
      const uploadFormDatas: FormData[] = [];
      let currentFormDataSize = 0;
      for (let i = 0; i < comicPages.length; i++) {
        const file = comicPages[i].file;
        if (!file) continue;

        // Split the request into multiple FormDatas/submissions if size is too big.
        if (currentFormDataSize + file.size > MAX_UPLOAD_BODY_SIZE) {
          currentFormData.append('hasMore', 'true');
          uploadFormDatas.push(currentFormData);
          currentFormData = new FormData();
          currentFormData.append('comicName', comic.name);
          currentFormDataSize = 0;
        }

        currentFormData.append(`pages`, file, pageNumberToPageName(i + 1, file.name));
        currentFormDataSize += file.size;
      }
      uploadFormDatas.push(currentFormData);

      for (const formData of uploadFormDatas) {
        const res = await fetch(`${IMAGES_SERVER_URL}/add-pages`, {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          isUploadError = true;
          setUploadError('An error occurred while uploading files.');
          break;
        }
      }
    }

    // Reverse the updates
    if (isUploadError) {
      const reverseFormData = new FormData();
      reverseFormData.append('comicName', comic.name.toString());
      reverseFormData.append(
        'pagesData',
        JSON.stringify(
          pagesData.map(pd => ({
            ...pd,
            newPos: pd.previousPos,
            previousPos: pd.newPos,
          }))
        )
      );

      await fetch(`${IMAGES_SERVER_URL}/rearrange-comic`, {
        method: 'POST',
        body: reverseFormData,
      });

      if (needsUpdateNumPages) {
        await updateNumberOfPages({
          body: JSON.stringify({ comicId: comic.id, numberOfpages: comic.numberOfPages }),
        });
      }
    }

    setIsSubmitting(false);
    if (isUploadError) {
      resetComicPages();
    } else {
      setTimeout(() => revalidator.revalidate(), 50);
      showSuccessToast(
        'Changes submitted successfully! (sorry about the pages jumping)',
        false,
        theme
      );
    }
  }

  const filesChanged = useMemo(() => {
    return calculateFilesChanged(initialPages, comicPages, initialPages);
  }, [comicPages, initialPages]);

  const [duplicateFilenames, setDuplicateFilenames] = useState<string[]>([]);

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      const filesWithString = await getFilesWithBase64(event.target.files);

      const newDuplicateFilenames: string[] = [];
      // Check for duplicate files
      for (const file of filesWithString) {
        if (!file.file?.name) continue;
        if (comicPages.some(f => f.file?.name === file.file?.name)) {
          newDuplicateFilenames.push(file.file?.name);
        }
      }
      setDuplicateFilenames(newDuplicateFilenames);
      if (newDuplicateFilenames.length > 0) return;

      const newFiles = [...comicPages, ...filesWithString];
      setComicPages(newFiles);
    }
  }

  return (
    <>
      {filesChanged.length > 0 && (
        <div className=" mb-4 mt-2">
          <p className="font-bold">Changes</p>
          <div className="flex flex-row flex-wrap gap-2">
            {[...filesChanged.sort((a, b) => a.newPos ?? 0 - (b.newPos ?? 0))].map(fc => (
              <span className="bg-theme1-primaryTrans p-1 rounded" key={fc.originalPos}>
                {fc.isNewPage ? (
                  <>New {fc.newPos}</>
                ) : fc.isDeleted ? (
                  <>
                    <IoMdTrash className="mb-1" />
                    {fc.originalPos}
                  </>
                ) : (
                  <>
                    {fc.originalPos} <MdArrowForward /> {fc.newPos}
                  </>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-row gap-4 items-center mb-2">
        <FileInput onChange={onFileChange} multiple accept="image/*" />

        {filesChanged.length > 0 && (
          <>
            <Button
              text="Reset"
              variant="outlined"
              color="error"
              onClick={() => {
                setComicPages(initialPages);
              }}
            />

            <LoadingButton
              text="Submit changes"
              onClick={submitPageChanges}
              isLoading={isSubmitting}
            />
          </>
        )}
      </div>

      {duplicateFilenames.length > 0 && (
        <InfoBox
          variant="error"
          text="Some files have the same name as existing files. The latest selection was not added. Offending files:"
          boldText={false}
          className="mb-2"
          fitWidth
          closable
          overrideOnCloseFunc={() => setDuplicateFilenames([])}
        >
          <p>
            {duplicateFilenames.map((filename, i) => (
              <span key={filename}>
                {filename}
                {i < duplicateFilenames.length - 1 && ', '}
              </span>
            ))}
          </p>
        </InfoBox>
      )}

      {uploadError && (
        <InfoBox
          variant="error"
          text={uploadError}
          className="mt-4 mb-2"
          fitWidth
          closable
          overrideOnCloseFunc={() => setUploadError(undefined)}
        />
      )}

      <p className="text-sm mb-4">
        Click an image to see it full size. You can add files in multiple batches as long
        as there are no duplicate file names. You can drop files onto the file selector
        button.
      </p>

      <PageManager
        files={comicPages}
        randomString={randomString}
        onChange={newFiles => {
          setComicPages(newFiles);
        }}
      />

      {filesChanged.length > 0 && (
        <div className="flex flex-row gap-4">
          <Button
            text="Reset"
            variant="outlined"
            color="error"
            onClick={() => {
              setComicPages(initialPages);
            }}
          />

          <LoadingButton
            text="Submit changes"
            onClick={submitPageChanges}
            isLoading={isSubmitting}
          />
        </div>
      )}
    </>
  );
}

type FileChange = {
  originalPos?: number;
  newPos?: number;
  isNewPage?: boolean;
  isDeleted?: boolean;
};

function calculateFilesChanged(
  originalFiles: { url?: string | undefined }[],
  newFiles: { url?: string | undefined }[],
  files: { url?: string | undefined }[]
) {
  const filesThatHaveChanged: FileChange[] = [];

  // find all pages that have changed position in the array
  for (let i = 0; i < files.length; i++) {
    const originalPage = files[i];
    const newPage = newFiles.find(f => f.url === originalPage.url);
    if (!newPage) continue;

    const newPos = newFiles.indexOf(newPage);
    if (newPos !== i) {
      filesThatHaveChanged.push({ originalPos: i + 1, newPos: newPos + 1 });
    }
  }

  for (let i = 0; i < newFiles.length; i++) {
    const newPage = newFiles[i];
    if (!newPage.url) {
      filesThatHaveChanged.push({ newPos: i + 1, isNewPage: true });
    }
  }

  for (let i = 0; i < originalFiles.length; i++) {
    const originalPage = originalFiles[i];
    if (!newFiles.find(f => f.url === originalPage.url)) {
      filesThatHaveChanged.push({ originalPos: i + 1, isDeleted: true });
    }
  }

  return filesThatHaveChanged;
}

function pageNumToUrl(pagesPath: string, comicName: string, pageNum: number) {
  return `${pagesPath}/${comicName}/${padPageNumber(pageNum)}.jpg`;
}
