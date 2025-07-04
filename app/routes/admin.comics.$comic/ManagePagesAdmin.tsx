import { useEffect, useMemo, useState } from 'react';
import { IoMdTrash } from 'react-icons/io';
import { MdArrowDownward, MdArrowUpward, MdCheck, MdClose } from 'react-icons/md';
import PageManager from '~/page-components/PageManager/PageManager';
import { MAX_PAGE_WIDTH, MAX_UPLOAD_BODY_SIZE } from '~/types/constants';
import type { Comic, ComicImageExtended, ProcessFilesArgs } from '~/types/types';
import Button from '~/ui-components/Buttons/Button';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import FileInput from '~/ui-components/FileInput';
import InfoBox from '~/ui-components/InfoBox';
import { generateRandomId, getFileExtension, getFilesWithBase64 } from '~/utils/general';
import { useUIPreferences } from '~/utils/theme-provider';
import { showSuccessToast, useGoodFetcher } from '~/utils/useGoodFetcher';
import useWindowSize from '~/utils/useWindowSize';
import { mobileClosedBarW, sidebarWidth } from '../admin/AdminSidebar';
import AdvancedPageManagement from './AdvancedPageManagement';
import { generateToken } from '~/utils/string-utils';
import type { ComicPageChangesBody } from '../api.admin.update-comic-pages';

type FileChangeRange = {
  firstOriginal: number;
  lastOriginal: number;
  firstNew: number;
  lastNew: number;
  changes: FileChange[];
};

type ManagePagesAdminProps = {
  comic: Comic;
  blockActions?: boolean;
  PAGES_PATH: string;
  IMAGES_SERVER_URL: string;
};

export default function ManagePagesAdmin({
  comic,
  blockActions,
  PAGES_PATH,
  IMAGES_SERVER_URL,
}: ManagePagesAdminProps) {
  const { theme } = useUIPreferences();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | undefined>();
  const [randomString, setRandomString] = useState<string>(generateRandomId());
  const { isMdUp } = useWindowSize();

  const windowWidth = (typeof window !== 'undefined' ? window.innerWidth : 0) as number;
  const renderedSidebarWidth = isMdUp ? sidebarWidth : mobileClosedBarW;
  const contentPadding = isMdUp ? 32 : 24;
  const pageManagerWidth = windowWidth - renderedSidebarWidth - 2 * contentPadding;

  const [initialPages, setInitialPages] = useState<ComicImageExtended[]>(
    comic.pages.map(p => ({
      url: `${PAGES_PATH}/comics/${comic.id}/${p.token}.jpg`,
      existingPageData: p,
      newPageNumber: p.pageNumber,
    }))
  );

  const [comicPages, setComicPages] = useState<ComicImageExtended[]>(
    comic.pages.map(p => ({
      url: `${PAGES_PATH}/comics/${comic.id}/${p.token}.jpg`,
      existingPageData: p,
      newPageNumber: p.pageNumber,
    }))
  );

  function resetComicPages() {
    const newInitialPages = comic.pages.map(p => ({
      url: `${PAGES_PATH}/comics/${comic.id}/${p.token}.jpg`,
      existingPageData: p,
      newPageNumber: p.pageNumber,
    }));
    setComicPages(newInitialPages);
    setInitialPages(newInitialPages);
    setRandomString(generateRandomId());
    setTimeout(() => {
      setRandomString(generateRandomId());
    }, 500);
  }

  useEffect(() => {
    resetComicPages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [PAGES_PATH, comic]);

  const updateFetcher = useGoodFetcher({
    url: '/api/admin/update-comic-pages',
    method: 'post',
  });

  async function submitPageChanges() {
    setIsSubmitting(true);

    const newPagesWithTempTokens: { pageNumber: number; tempToken: string }[] = [];

    // Upload new pages
    const newPages = filesChanged.filter(f => f.isNewPage);
    if (newPages.length > 0) {
      const filesFormDatas = Array<FormData>();

      const processFilesArgs: ProcessFilesArgs = {
        formats: ['jpg'],
        maxWidth: MAX_PAGE_WIDTH,
      };
      let currentFormData = new FormData();
      currentFormData.append('argsJson', JSON.stringify(processFilesArgs));
      let currentFormDataSize = 0;

      for (const newPage of comicPages.filter(p => !p.existingPageData && p.file)) {
        const tempToken = generateToken();
        newPagesWithTempTokens.push({ pageNumber: newPage.newPageNumber!, tempToken });

        // Split the request into multiple FormDatas/submissions if size is too big.
        if (currentFormDataSize + newPage.file!.size > MAX_UPLOAD_BODY_SIZE) {
          filesFormDatas.push(currentFormData);
          currentFormData = new FormData();
          currentFormDataSize = 0;
          currentFormData.append('argsJson', JSON.stringify(processFilesArgs));
        }

        currentFormData.append(
          `files`,
          newPage.file!,
          `${tempToken}.${getFileExtension(newPage.file!.name)}`
        );
        currentFormDataSize += newPage.file!.size;
      }

      filesFormDatas.push(currentFormData);

      for (const formData of filesFormDatas) {
        try {
          const res = await fetch(`${IMAGES_SERVER_URL}/process-files`, {
            method: 'POST',
            body: formData,
          });

          if (!res.ok) {
            return { error: 'Error uploading files to server', pages: [] };
          }
        } catch (e) {
          console.error(e);
          return { error: 'Error uploading files to server', pages: [] };
        }
      }
    }

    const body: ComicPageChangesBody = {
      comicId: comic.id,
      deletedPageTokens: filesChanged.filter(c => c.isDeleted).map(c => c.token!),
      changedPages: filesChanged
        .filter(c => !c.isUnchanged && c.newPos && c.token)
        .map(c => ({
          token: c.token!,
          pageNumber: c.newPos!,
        })),
      newPagesWithTempTokens,
      newNumberOfPages: comicPages.length,
      shouldUpdateLastUpdatedTimestamp: needsUpdateUpdatedTimestamp,
    };

    await updateFetcher.awaitSubmit({ body: JSON.stringify(body) });

    setIsSubmitting(false);
    showSuccessToast('Pages changed', false, theme);
  }

  const { filesChanged, visualChanges, needsUpdateUpdatedTimestamp } = useMemo(() => {
    const {
      visualChanges,
      filesChanged: newFilesChanged,
      unchangedFiles: newUnchangedFiles,
    } = calculateFilesChanged(initialPages, comicPages, initialPages);

    const isOnlyAddingPages =
      newFilesChanged.length > 0 && newFilesChanged.every(f => f.isNewPage);
    let newNeedsUpdateUpdatedTimestamp = isOnlyAddingPages;

    if (!newNeedsUpdateUpdatedTimestamp && newFilesChanged.some(f => f.isNewPage)) {
      const lastNewPage =
        newFilesChanged
          .filter(f => f.isNewPage && f.newPos)
          .sort((a, b) => a.newPos! - b.newPos!)[0]?.newPos ?? 0;
      const lastUnchangedPage =
        newUnchangedFiles[newUnchangedFiles.length - 1]?.newPos ?? 0;
      const lastNotNewChangedPage =
        newFilesChanged
          .filter(f => !f.isNewPage && f.newPos)
          .sort((a, b) => a.newPos! - b.newPos!)[0]?.newPos ?? 0;

      const highestNotNewPage = Math.max(
        lastNotNewChangedPage ?? 0,
        lastUnchangedPage ?? 0
      );

      if ((lastNewPage ?? 0) > highestNotNewPage) {
        newNeedsUpdateUpdatedTimestamp = true;
      }
    }

    return {
      filesChanged: newFilesChanged,
      visualChanges,
      needsUpdateUpdatedTimestamp: newNeedsUpdateUpdatedTimestamp,
    };
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

      const newFiles = [
        ...comicPages,
        ...filesWithString.map((f, i) => ({
          ...f,
          newPageNumber: comicPages.length + i + 1,
        })),
      ];
      setComicPages(newFiles);
    }
  }

  return (
    <>
      <AdvancedPageManagement
        comic={comic}
        imagesServerUrl={IMAGES_SERVER_URL}
        blockActions={!!blockActions}
      />

      <p className="font-semibold mt-4 mb-1">Add pages</p>

      <div className="flex flex-row flex-wrap gap-4 items-center mb-2">
        <FileInput onChange={onFileChange} multiple accept="image/*" disabled />
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

      <p className="font-semibold mt-4">
        Manage pages{filesChanged.length > 0 ? ' (unsaved changes)' : ''}
      </p>
      <p className="text-sm mb-2">
        You can add files in multiple batches as long as there are no duplicate file
        names. You can drop files onto the file selector button.
      </p>

      {visualChanges.length > 0 && (
        <div className=" mb-4 mt-2">
          <div className="flex flex-row flex-wrap gap-2">
            <FileChangesDisplay changes={visualChanges} />
          </div>
        </div>
      )}

      <PageManager
        files={comicPages}
        randomString={randomString}
        onChange={setComicPages}
        pageManagerWidth={pageManagerWidth}
        source="admin"
      />

      {filesChanged.length > 0 && (
        <>
          <div className="mb-2">
            {needsUpdateUpdatedTimestamp ? (
              <p>
                <MdCheck className="inline-block" />
                Comic's last updated time will be updated
              </p>
            ) : (
              <p>
                <MdClose className="inline-block" />
                Comic's last updated time will not change
              </p>
            )}
            <p className="text-xs">
              Updated times are only changed when adding <i>new pages</i> to the{' '}
              <i>end</i> of a comic - updates, not fixes.
            </p>
          </div>

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
              disabled={blockActions}
            />
          </div>
        </>
      )}
    </>
  );
}

type FileChange = {
  originalPos?: number;
  newPos?: number;
  isNewPage?: boolean;
  isDeleted?: boolean;
  isUnchanged?: boolean;
  token?: string;
};

function calculateFilesChanged(
  originalFiles: ComicImageExtended[],
  newFiles: ComicImageExtended[],
  files: ComicImageExtended[]
) {
  const filesThatHaveChanged: FileChange[] = [];
  const filesThatHaveNotChanged: FileChange[] = [];

  // find all pages that have changed position in the array
  for (let i = 0; i < files.length; i++) {
    const originalPage = files[i];
    const newPage = newFiles.find(f => f.url === originalPage.url);
    if (!newPage) continue;

    const newPos = newFiles.indexOf(newPage);
    if (newPos !== i) {
      filesThatHaveChanged.push({
        originalPos: i + 1,
        newPos: newPos + 1,
        token: originalPage.existingPageData?.token,
      });
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
      filesThatHaveChanged.push({
        originalPos: i + 1,
        isDeleted: true,
        token: originalPage.existingPageData?.token,
      });
    } else {
      // If this page is already in filesThatHaveChanged, skip.
      // Otherwise, add it to filesThatHaveNotChanged.
      const isAlreadyInFilesThatHaveChanged = filesThatHaveChanged.find(
        f => f.originalPos === i + 1
      );
      if (!isAlreadyInFilesThatHaveChanged) {
        filesThatHaveNotChanged.push({
          originalPos: i + 1,
          isUnchanged: true,
          token: originalPage.existingPageData?.token,
        });
      }
    }
  }

  return {
    visualChanges: combineSequentialFileChanges(filesThatHaveChanged),
    filesChanged: filesThatHaveChanged,
    unchangedFiles: filesThatHaveNotChanged,
  };
}

function combineSequentialFileChanges(
  changes: FileChange[]
): (FileChange | FileChangeRange)[] {
  const result: (FileChange | FileChangeRange)[] = [];
  let rangeStartIdx = 0;

  while (rangeStartIdx < changes.length) {
    const currentRange = [changes[rangeStartIdx]];
    let rangeEndIdx = rangeStartIdx + 1;

    while (
      rangeEndIdx < changes.length &&
      changes[rangeEndIdx].originalPos !== undefined &&
      changes[rangeEndIdx].newPos !== undefined &&
      changes[rangeEndIdx - 1].originalPos !== undefined &&
      changes[rangeEndIdx - 1].newPos !== undefined &&
      changes[rangeEndIdx].originalPos! - changes[rangeEndIdx - 1].originalPos! ===
        changes[rangeEndIdx].newPos! - changes[rangeEndIdx - 1].newPos!
    ) {
      currentRange.push(changes[rangeEndIdx]);
      rangeEndIdx++;
    }

    if (currentRange.length > 1) {
      result.push({
        firstOriginal: currentRange[0].originalPos!,
        lastOriginal: currentRange[currentRange.length - 1].originalPos!,
        firstNew: currentRange[0].newPos!,
        lastNew: currentRange[currentRange.length - 1].newPos!,
        changes: currentRange,
      });
    } else {
      result.push(currentRange[0]);
    }

    rangeStartIdx = rangeEndIdx;
  }

  return result;
}

function isFileChangeRange(x: any): x is FileChangeRange {
  return 'firstOriginal' in x;
}

function FileChangesDisplay({ changes }: { changes: (FileChange | FileChangeRange)[] }) {
  const sorted = changes.sort((a, b) => {
    if (isFileChangeRange(a) && isFileChangeRange(b)) {
      return a.firstOriginal - b.firstOriginal;
    }
    if (isFileChangeRange(a) && !isFileChangeRange(b)) {
      return a.firstOriginal - (b.originalPos ?? b.newPos ?? 0);
    }
    if (isFileChangeRange(b) && !isFileChangeRange(a)) {
      return (a.originalPos ?? a.newPos ?? 0) - b.firstOriginal;
    }
    if (!isFileChangeRange(a) && !isFileChangeRange(b)) {
      return (a.originalPos ?? a.newPos ?? 0) - (b.originalPos ?? b.newPos ?? 0);
    }
    return 0;
  });

  return sorted.map((changeOrRange, i) => {
    if (isFileChangeRange(changeOrRange)) {
      const isUp = changeOrRange.firstNew > changeOrRange.firstOriginal;
      return (
        <span className="bg-theme1-primaryTrans p-1 rounded" key={i}>
          {changeOrRange.firstOriginal}..{changeOrRange.lastOriginal}{' '}
          {isUp ? <MdArrowUpward /> : <MdArrowDownward />} {changeOrRange.firstNew}..
          {changeOrRange.lastNew}
        </span>
      );
    }

    const isUp =
      changeOrRange.newPos && changeOrRange.originalPos
        ? changeOrRange.newPos > changeOrRange.originalPos
        : false;
    return (
      <span className="bg-theme1-primaryTrans p-1 rounded" key={i}>
        {changeOrRange.isNewPage ? (
          <>New {changeOrRange.newPos}</>
        ) : changeOrRange.isDeleted ? (
          <>
            <IoMdTrash className="mb-1" />
            {changeOrRange.originalPos}
          </>
        ) : (
          <>
            {changeOrRange.originalPos} {isUp ? <MdArrowUpward /> : <MdArrowDownward />}{' '}
            {changeOrRange.newPos}
          </>
        )}
      </span>
    );
  });
}
