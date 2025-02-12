import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import useWindowSize from '~/utils/useWindowSize';
import type { ComicImage } from '~/utils/general';
import { MdArrowBack, MdArrowForward, MdDelete } from 'react-icons/md';
import { DraggableCore } from 'react-draggable';
import { FaExpandAlt } from 'react-icons/fa';
import { FaEllipsis } from 'react-icons/fa6';
import TextInput from '~/ui-components/TextInput/TextInput';
import Button from '~/ui-components/Buttons/Button';

const RATIO = Math.round(400 / 564);
const PAGE_NAME_HEIGHT = 40;
const MOBILE_PAGE_IMG_HEIGHT = 100;

type HoveredPage = {
  pageNum: number;
  side: 'left' | 'right';
};

function getImgSource(file: ComicImage, randomString?: string) {
  if (file.url) {
    if (randomString) {
      return `${file.url}?${randomString}`;
    }
    return file.url;
  }
  return file.base64;
}

type PageManagerProps = {
  files: ComicImage[];
  onChange: (newFiles: ComicImage[]) => void;
  pageManagerWidth: number;
  randomString?: string;
  source: 'admin' | 'comic-upload';
};

export default function PageManager({
  files,
  onChange,
  randomString,
  pageManagerWidth,
  source,
}: PageManagerProps) {
  const { isMobile } = useWindowSize();
  const [fullSizeImageIndex, setFullSizeImageIndex] = useState<number | undefined>(
    undefined
  );
  const [isManuallyChangingPageOfIndex, setIsManuallyChangingPageOfIndex] = useState<
    number | undefined
  >(undefined);
  const [manualPageChangeNewPosition, setManualPageChangeNewPosition] =
    useState<string>('1');

  const fullSizeImageSource = useMemo(() => {
    if (fullSizeImageIndex === undefined) return undefined;
    if (files[fullSizeImageIndex].url)
      return `${files[fullSizeImageIndex].url}?${randomString}`;
    return files[fullSizeImageIndex].base64;
  }, [files, fullSizeImageIndex, randomString]);

  const pageImgHeight = isMobile ? MOBILE_PAGE_IMG_HEIGHT : 160;
  const pageContainerHeight = pageImgHeight + PAGE_NAME_HEIGHT;
  const pageImgWidth = pageImgHeight * RATIO;

  const deleteImage = useCallback(
    (imageIndex: number) => {
      const newFiles = [...files];
      newFiles.splice(imageIndex, 1);
      onChange(newFiles);
    },
    [files, onChange]
  );

  // insert page at index into new position
  const setNewPagePosition = useCallback(
    (fromIndex: number, toIndex: number) => {
      const newFiles = [...files];
      const temp = newFiles[fromIndex];
      newFiles.splice(fromIndex, 1);
      newFiles.splice(toIndex, 0, temp);
      onChange(newFiles);
    },
    [files, onChange]
  );

  const numPages = files.length;
  const pagesPerRow = Math.floor(pageManagerWidth / pageImgWidth);

  const showPageNames = useMemo(() => {
    if (source === 'comic-upload') return true;
    return files.some(file => !file.url);
  }, [files, source]);

  const [hoveredPage, setHoveredPage] = useState<HoveredPage | undefined>(undefined);

  // const startOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [startOffset, setStartOffset] = useState<{ x: number; y: number } | undefined>(
    undefined
  );

  const [draggedPageNum, setDraggedPageNum] = useState<number | undefined>(undefined);

  // If hitting delete then dragging, this is needed to stop the new page filling the same slot from dragging
  const [didJustDelete, setDidJustDelete] = useState(false);

  const getPageContainerRows = useCallback(() => {
    const pageContainerRows: React.ReactNode[][] = [];
    const numRows = Math.ceil(numPages / pagesPerRow);

    for (let row = 0; row < numRows; row++) {
      const newRow: React.ReactNode[] = [];
      let col = 0;
      for (; col < pagesPerRow; col++) {
        const index = row * pagesPerRow + col;
        const page = files[index];
        if (page) {
          newRow.push(
            <Page
              position={{ row: row, col: col }}
              key={index}
              file={page}
              index={index}
              deleteImage={deleteImage}
              isMobile={isMobile}
              randomString={randomString}
              pageImgHeight={pageImgHeight}
              pageImgWidth={pageImgWidth}
              pageContainerHeight={pageContainerHeight}
              setHoveredPage={setHoveredPage}
              hoveredPage={hoveredPage}
              setStartOffset={setStartOffset}
              startOffset={startOffset}
              setDraggedPageNum={setDraggedPageNum}
              draggedPageNum={draggedPageNum}
              setNewPosition={(newPos: number) => setNewPagePosition(index, newPos)}
              didJustDelete={didJustDelete}
              setDidJustDelete={setDidJustDelete}
              showPageNames={showPageNames}
              onSetFullSize={() => setFullSizeImageIndex(index)}
              isLastPage={index === files.length - 1}
              onEnterChangePageMode={() => setIsManuallyChangingPageOfIndex(index)}
            />
          );
        } else {
          break;
        }
      }
      pageContainerRows.push(newRow);
    }
    return pageContainerRows;
  }, [
    deleteImage,
    didJustDelete,
    draggedPageNum,
    files,
    hoveredPage,
    isMobile,
    numPages,
    pageContainerHeight,
    pageImgHeight,
    pageImgWidth,
    pagesPerRow,
    randomString,
    setNewPagePosition,
    showPageNames,
    startOffset,
  ]);

  const pageContainerRows = useMemo(() => getPageContainerRows(), [getPageContainerRows]);

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (fullSizeImageIndex === undefined) return;

      if (e.key === 'ArrowLeft' && fullSizeImageIndex > 0) {
        setFullSizeImageIndex(fullSizeImageIndex - 1);
      } else if (e.key === 'ArrowRight' && fullSizeImageIndex < files.length - 1) {
        setFullSizeImageIndex(fullSizeImageIndex + 1);
      } else if (e.key === 'Escape' || e.key === ' ') {
        setFullSizeImageIndex(undefined);
        // Prevent page scrolling when using spacebar
        e.preventDefault();
      }
    },
    [fullSizeImageIndex, files]
  );

  useEffect(() => {
    if (fullSizeImageIndex !== undefined) {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [fullSizeImageIndex, handleKeyPress]);

  const shouldDisableSetPageManuallyButton = useMemo(() => {
    if (manualPageChangeNewPosition === '') return true;
    if (Number.isNaN(parseInt(manualPageChangeNewPosition))) return true;
    if (parseInt(manualPageChangeNewPosition) < 1) return true;
    if (parseInt(manualPageChangeNewPosition) > numPages) return true;
    return false;
  }, [manualPageChangeNewPosition, numPages]);

  function setPageManually() {
    if (shouldDisableSetPageManuallyButton || isManuallyChangingPageOfIndex === undefined)
      return;
    if (isManuallyChangingPageOfIndex !== parseInt(manualPageChangeNewPosition) - 1) {
      setNewPagePosition(
        isManuallyChangingPageOfIndex,
        parseInt(manualPageChangeNewPosition) - 1
      );
    }

    setIsManuallyChangingPageOfIndex(undefined);
    setManualPageChangeNewPosition('');
  }

  return (
    <>
      <div
        className="w-full relative"
        style={{ height: pageContainerRows.length * pageContainerHeight }}
      >
        {pageContainerRows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex flex-row">
            {row}
          </div>
        ))}
      </div>

      {fullSizeImageIndex !== undefined && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50 cursor-pointer"
          onClick={() => {
            setFullSizeImageIndex(undefined);
          }}
        >
          <div className="relative" style={{ maxHeight: '90%', maxWidth: '90%' }}>
            <img
              src={fullSizeImageSource}
              style={{ maxHeight: '90vh', maxWidth: '90vw' }}
              alt={files[fullSizeImageIndex].file?.name || files[fullSizeImageIndex].url}
            />
            {/* Left half click area */}
            <div
              className="absolute top-0 left-0 w-1/2 h-full cursor-w-resize"
              onClick={e => {
                e.stopPropagation();
                if (fullSizeImageIndex > 0) {
                  setFullSizeImageIndex(fullSizeImageIndex - 1);
                }
              }}
            />
            {/* Right half click area */}
            <div
              className="absolute top-0 right-0 w-1/2 h-full cursor-e-resize"
              onClick={e => {
                e.stopPropagation();
                if (fullSizeImageIndex < files.length - 1) {
                  setFullSizeImageIndex(fullSizeImageIndex + 1);
                }
              }}
            />
          </div>
          <div className="absolute bottom-4 text-white text-sm opacity-75">
            Use arrow keys or click sides to navigate between pages
          </div>
        </div>
      )}

      {isManuallyChangingPageOfIndex !== undefined && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50 cursor-pointer"
          onClick={() => {
            setIsManuallyChangingPageOfIndex(undefined);
          }}
        >
          <div
            className="relative bg-white dark:bg-gray-250 p-4 pt-3"
            onClick={e => {
              e.stopPropagation();
            }}
          >
            <p className="font-bold">Set page position</p>
            <p className="text-sm text-gray-600 dark:text-gray-800">
              Current: {isManuallyChangingPageOfIndex + 1} - max: {numPages}
            </p>
            <TextInput
              onChange={newVal => {
                if (newVal === '') setManualPageChangeNewPosition('');
                else if (Number.isNaN(parseInt(newVal))) return;
                else setManualPageChangeNewPosition(newVal);
              }}
              value={manualPageChangeNewPosition}
            />
            <div className="flex justify-end gap-2 mt-3">
              <Button
                onClick={() => {
                  setManualPageChangeNewPosition('');
                  setIsManuallyChangingPageOfIndex(undefined);
                }}
                text="Cancel"
                variant="outlined"
              />
              <Button
                onClick={setPageManually}
                text="Set page"
                disabled={shouldDisableSetPageManuallyButton}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

type PageProps = {
  position: {
    row: number;
    col: number;
  };
  file: ComicImage;
  index: number;
  deleteImage: (index: number) => void;
  isMobile: boolean;
  randomString?: string;
  pageImgHeight: number;
  pageImgWidth: number;
  pageContainerHeight: number;
  setHoveredPage: (
    pageNum: { pageNum: number; side: 'left' | 'right' } | undefined
  ) => void;
  hoveredPage: { pageNum: number; side: 'left' | 'right' } | undefined;
  setStartOffset: (startOffset: { x: number; y: number } | undefined) => void;
  startOffset: { x: number; y: number } | undefined;
  setDraggedPageNum: (pageNum: number | undefined) => void;
  draggedPageNum: number | undefined;
  setNewPosition: (pageNum: number) => void;
  didJustDelete: boolean;
  setDidJustDelete: (didJustDelete: boolean) => void;
  showPageNames: boolean;
  onSetFullSize: () => void;
  isLastPage: boolean;
  onEnterChangePageMode: () => void;
};

function Page({
  position,
  file,
  index,
  deleteImage,
  isMobile,
  randomString,
  pageImgHeight,
  pageImgWidth,
  pageContainerHeight,
  setHoveredPage,
  hoveredPage,
  setStartOffset,
  startOffset,
  setDraggedPageNum,
  draggedPageNum,
  setNewPosition,
  didJustDelete,
  setDidJustDelete,
  showPageNames,
  onSetFullSize,
  isLastPage,
  onEnterChangePageMode,
}: PageProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const translateX = position.col * pageImgWidth;
  const translateY = position.row * pageContainerHeight;

  const isHoveredLeft =
    hoveredPage?.pageNum === index &&
    hoveredPage.side === 'left' &&
    draggedPageNum !== index - 1;

  const isHoveredRight =
    hoveredPage?.pageNum === index &&
    hoveredPage.side === 'right' &&
    draggedPageNum !== index + 1;

  const [moveTranslate, setMoveTranslate] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  function maybeChangeDraggedPagePosition(hoveredPage: HoveredPage | undefined) {
    let newPosition = undefined;
    if (!hoveredPage) return;
    if (hoveredPage.side === 'left') {
      if (index < hoveredPage.pageNum) {
        newPosition = hoveredPage.pageNum - 1;
      } else {
        newPosition = hoveredPage.pageNum;
      }
    } else if (hoveredPage.side === 'right') {
      if (index > hoveredPage.pageNum) {
        newPosition = hoveredPage.pageNum + 1;
      } else {
        newPosition = hoveredPage.pageNum;
      }
    }
    if (newPosition !== undefined && newPosition !== index) {
      setNewPosition(newPosition);
    }
  }

  return (
    <>
      <Separator
        height={pageContainerHeight}
        pageImgWidth={pageImgWidth}
        pageContainerHeight={pageContainerHeight}
        beforeColumnNum={position.col}
        rowNum={position.row}
        isShown={isHoveredLeft && !!startOffset}
        onHover={() => {
          if (index !== hoveredPage?.pageNum && !!startOffset) {
            setHoveredPage({ pageNum: index, side: 'left' });
          }
        }}
      />

      <DraggableCore
        nodeRef={nodeRef}
        disabled={isMobile}
        onStop={e => {
          if (didJustDelete) {
            setTimeout(() => {
              setDidJustDelete(false);
            }, 50);
            return;
          }
          maybeChangeDraggedPagePosition(hoveredPage);
          setIsDragging(false);
          setHoveredPage(undefined);
          setMoveTranslate({ x: 0, y: 0 });
          setStartOffset(undefined);
          setDraggedPageNum(undefined);
        }}
        onStart={e => {
          if (didJustDelete) return;
          setIsDragging(true);
          // @ts-ignore
          const targetClassName = e.target?.className;
          if (targetClassName.includes('deleteBtn')) {
            setDidJustDelete(true);
            deleteImage(index);
            setIsDragging(false);
            return;
          } else if (targetClassName.includes('expandBtn')) {
            onSetFullSize();
            return;
          }
          // @ts-ignore
          setStartOffset({ x: e.pageX, y: e.pageY });
          setDraggedPageNum(index);
        }}
        onDrag={e => {
          if (didJustDelete || !startOffset) return;

          const newTranslate = {
            // @ts-ignore
            x: -(startOffset.x - e.pageX),
            // @ts-ignore
            y: -(startOffset.y - e.pageY),
          };
          setMoveTranslate(newTranslate);
        }}
      >
        <div
          ref={nodeRef}
          key={file.file?.name ?? file.url ?? index}
          style={{
            height: pageContainerHeight,
            width: pageImgWidth,
            pointerEvents: isDragging ? 'none' : 'auto',
            position: 'absolute',
            left: translateX,
            top: translateY,
            transform: `translate(${moveTranslate.x}px, ${moveTranslate.y}px) scale(${isDragging ? 0.75 : 1})`,
            transition: 'scale 0.2s ease-in-out',
            zIndex: isDragging ? 15 : 0,
            opacity: isDragging ? 0.75 : 1,
          }}
        >
          {/* Custom buttons, because we need pointer-events-none on the icon */}
          <div
            className={`
              absolute top-1 right-1 z-10 deleteBtn rounded-full w-7 h-7 flex items-center justify-center
              cursor-pointer bg-red-strong-100 hover:bg-red-strong-300 opacity-90 hover:opacity-100
              transition-all duration-100
            `}
            role="button"
            onClick={() => isMobile && deleteImage(index)}
          >
            <MdDelete className="deleteBtn pointer-events-none text-white mt-[3px]" />
          </div>
          {!isMobile && (
            <div
              className={`
              absolute top-1 z-10 expandBtn rounded-full w-7 h-7 flex items-center justify-center
              cursor-pointer opacity-90 hover:opacity-100 bg-gray-600 hover:bg-gray-750
              transition-all duration-100 ${isMobile ? 'left-1' : 'right-9'}
            `}
              role="button"
              onClick={() => isMobile && onSetFullSize()}
            >
              <FaExpandAlt
                className="expandBtn pointer-events-none text-white mt-[3px]"
                size={14}
              />
            </div>
          )}

          <div className="h-full w-full flex flex-col items-center justify-center hover:cursor-move">
            {/* Two half width divs to detect left vs right side hover */}
            {!isMobile && (
              <>
                <div
                  className="absolute left-0 w-1/2 h-full opacity-0"
                  onMouseEnter={() => {
                    if (!startOffset) return;
                    if (index !== hoveredPage?.pageNum) {
                      setHoveredPage({ pageNum: index, side: 'left' });
                    }
                  }}
                  onMouseMove={() => {
                    if (!startOffset) return;
                    if (index !== hoveredPage?.pageNum) {
                      setHoveredPage({ pageNum: index, side: 'left' });
                    }
                  }}
                  onMouseLeave={() => {
                    if (!startOffset) return;
                    if (index === hoveredPage?.pageNum) {
                      setHoveredPage(undefined);
                    }
                  }}
                />
                <div
                  className="absolute right-0 w-1/2 h-full opacity-0"
                  onMouseEnter={() => {
                    if (!startOffset) return;
                    if (index !== hoveredPage?.pageNum) {
                      setHoveredPage({ pageNum: index, side: 'right' });
                    }
                  }}
                  onMouseMove={() => {
                    if (!startOffset) return;
                    if (index !== hoveredPage?.pageNum) {
                      setHoveredPage({ pageNum: index, side: 'right' });
                    }
                  }}
                  onMouseLeave={() => {
                    if (!startOffset) return;
                    if (index === hoveredPage?.pageNum) {
                      setHoveredPage(undefined);
                    }
                  }}
                />
              </>
            )}

            <img
              src={getImgSource(file, randomString)}
              height={pageImgHeight}
              style={{
                objectFit: 'cover',
                maxHeight: pageImgHeight,
                maxWidth: pageImgWidth - 4,
                marginLeft: 4,
              }}
              draggable={false}
              alt={file.file?.name || file.url}
              onClick={() => {
                if (isMobile) {
                  onSetFullSize();
                }
              }}
            />

            <p
              className="whitespace-pre-wrap break-all overflow-ellipsis overflow-hidden leading-none text-center mt-0.5"
              style={{ height: PAGE_NAME_HEIGHT, width: pageImgWidth }}
            >
              <span className="mr-1">
                <b>{index + 1}</b>
              </span>
              {showPageNames && (
                <span className="text-xs">
                  {formatPageSource(file.file?.name ?? file.url)}
                </span>
              )}
            </p>

            {isMobile && (
              <>
                <div
                  className={`
                    absolute left-1 top-1 z-10 deleteBtn rounded-full w-7 h-7 flex items-center justify-center
                    cursor-pointer bg-gray-600 hover:bg-gray-750 opacity-90 hover:opacity-100
                    transition-all duration-100
                  `}
                  role="button"
                  onClick={onEnterChangePageMode}
                >
                  <FaEllipsis className="deleteBtn pointer-events-none text-white mt-[3px]" />
                </div>
                {index !== 0 && (
                  <div
                    className={`
                    absolute left-1 z-10 deleteBtn rounded-full w-7 h-7 flex items-center justify-center
                    cursor-pointer bg-gray-600 hover:bg-gray-750 opacity-90 hover:opacity-100
                    transition-all duration-100
                  `}
                    role="button"
                    onClick={() => {
                      setNewPosition(index - 1);
                    }}
                    style={{ bottom: pageContainerHeight - MOBILE_PAGE_IMG_HEIGHT }}
                  >
                    <MdArrowBack className="deleteBtn pointer-events-none text-white mt-[3px]" />
                  </div>
                )}
                {!isLastPage && (
                  <div
                    className={`
                    absolute right-1 z-10 deleteBtn rounded-full w-7 h-7 flex items-center justify-center
                    cursor-pointer bg-gray-600 hover:bg-gray-750 opacity-90 hover:opacity-100
                    transition-all duration-100
                  `}
                    role="button"
                    onClick={() => {
                      setNewPosition(index + 1);
                    }}
                    style={{ bottom: pageContainerHeight - MOBILE_PAGE_IMG_HEIGHT }}
                  >
                    <MdArrowForward className="deleteBtn pointer-events-none text-white mt-[3px]" />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </DraggableCore>

      {isHoveredRight && (
        <Separator
          height={pageContainerHeight}
          pageImgWidth={pageImgWidth}
          pageContainerHeight={pageContainerHeight}
          beforeColumnNum={position.col + 1}
          rowNum={position.row}
          isShown={isHoveredRight && !!startOffset}
          onHover={() => {
            if (index !== hoveredPage?.pageNum && !!startOffset) {
              setHoveredPage({ pageNum: index, side: 'right' });
            }
          }}
        />
      )}
    </>
  );
}

function formatPageSource(pageSource: string | undefined) {
  if (!pageSource) return '';
  // Formats urls with xxxxx/0001.jpg to 0001. Otherwise, return the url as is.
  const match = pageSource.match(/\/(\d{1,4})\./);
  if (!match) return pageSource;
  return match[1];
}

type SeparatorProps = {
  height: number;
  pageImgWidth: number;
  pageContainerHeight: number;
  beforeColumnNum: number;
  rowNum: number;
  isShown: boolean;
  onHover: (isHovered: boolean) => void;
};

function Separator({
  height,
  pageImgWidth,
  pageContainerHeight,
  beforeColumnNum,
  rowNum,
  isShown,
  onHover,
}: SeparatorProps) {
  return (
    <div
      className="w-1 bg-theme1-dark dark:bg-theme1-darker absolute z-10"
      style={{
        height,
        left: beforeColumnNum * pageImgWidth,
        top: rowNum * pageContainerHeight,
        opacity: isShown ? 1 : 0,
      }}
      onMouseEnter={() => {
        onHover(true);
      }}
      onMouseLeave={() => {
        onHover(false);
      }}
    />
  );
}
