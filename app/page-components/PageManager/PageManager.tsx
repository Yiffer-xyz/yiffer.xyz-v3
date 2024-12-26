// import { GridContextProvider, GridDropZone, GridItem, swap } from 'react-grid-dnd';
import { useCallback, useMemo, useRef, useState } from 'react';
import useWindowSize from '~/utils/useWindowSize';
import type { ComicImage } from '~/utils/general';
import { MdDelete } from 'react-icons/md';
import { DraggableCore } from 'react-draggable';
import { FaExpandAlt } from 'react-icons/fa';

const RATIO = Math.round(400 / 564);
const PAGE_NAME_HEIGHT = 40;

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
  const [fullSizeImage, setFullSizeImage] = useState<ComicImage | undefined>(undefined);

  const pageImgHeight = isMobile ? 100 : 160;
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
              setFullSizeImage={setFullSizeImage}
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

      {fullSizeImage && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => {
            setFullSizeImage(undefined);
          }}
        >
          <img
            src={fullSizeImage.url || fullSizeImage.base64}
            style={{ maxHeight: '90%', maxWidth: '90%' }}
            alt={fullSizeImage.file?.name || fullSizeImage.url}
          />
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
  setFullSizeImage: (file: ComicImage) => void;
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
  setFullSizeImage,
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
            setFullSizeImage(file);
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
              absolute top-1 right-1 z-10 deleteBtn rounded-full w-6 h-6 flex items-center justify-center
              cursor-pointer bg-red-strong-100 hover:bg-red-strong-300 opacity-90 hover:opacity-100
              transition-all duration-100
            `}
          >
            <MdDelete className="deleteBtn pointer-events-none text-white mt-[3px]" />
          </div>
          <div
            className={`
              absolute top-1 right-8 z-10 expandBtn rounded-full w-6 h-6 flex items-center justify-center
              cursor-pointer opacity-90 hover:opacity-100 bg-gray-600 hover:bg-gray-750
              transition-all duration-100
            `}
          >
            <FaExpandAlt
              className="expandBtn pointer-events-none text-white mt-[3px]"
              size={14}
            />
          </div>

          {/* Two half width divs to detect left vs right side hover */}
          <div className="h-full w-full flex flex-col items-center justify-center hover:cursor-move">
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
    ></div>
  );
}
