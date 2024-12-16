import { GridContextProvider, GridDropZone, GridItem, swap } from 'react-grid-dnd';
import { useMemo, useRef, useState } from 'react';
import useWindowSize from '~/utils/useWindowSize';
import type { ComicImage } from '~/utils/general';
import { MdDelete } from 'react-icons/md';
import IconButton from '~/ui-components/Buttons/IconButton';
// import 'react-grid-dnd/dist/';

const RATIO = Math.round(400 / 564);
const PAGE_NAME_HEIGHT = 40;
const PAGES_SPACING = 4;

type PageManagerProps = {
  files: ComicImage[];
  onChange: (newFiles: ComicImage[]) => void;
  randomString?: string;
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

export default function PageManager({ files, onChange, randomString }: PageManagerProps) {
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const { width, isMobile } = useWindowSize();
  const [hoveredPageNum, setHoveredPageNum] = useState<number>();
  const [isHalfSize, setIsHalfSize] = useState(false);
  const [fullSizeImage, setFullSizeImage] = useState<ComicImage | undefined>(undefined);
  const lastDragEndTime = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  let PAGE_IMG_HEIGHT = isMobile ? 100 : 160;
  if (isHalfSize) PAGE_IMG_HEIGHT = PAGE_IMG_HEIGHT / 2;
  const PAGE_CONTAINER_HEIGHT = PAGE_IMG_HEIGHT + PAGE_NAME_HEIGHT;
  const PAGE_IMG_WIDTH = PAGE_IMG_HEIGHT * RATIO;

  function onDragEnd(_: string, sourceIndex: number, targetIndex: number) {
    lastDragEndTime.current = Date.now();
    if (sourceIndex === targetIndex) return;
    const newFiles = swap(files, sourceIndex, targetIndex);
    onChange(newFiles);
  }

  const dragdropSizing = useMemo<{ pagesPerRow: number; containerHeight: number }>(() => {
    if (!gridContainerRef?.current) {
      return { containerHeight: 1, pagesPerRow: 1 };
    }
    const containerWidth = gridContainerRef?.current.clientWidth;
    const pagesPerRow = Math.floor(containerWidth / (PAGE_IMG_WIDTH + PAGES_SPACING));
    const numberOfRows = Math.ceil(files.length / pagesPerRow);
    const containerHeight = numberOfRows * (PAGE_CONTAINER_HEIGHT + PAGES_SPACING);
    return { pagesPerRow, containerHeight };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    PAGE_CONTAINER_HEIGHT,
    PAGE_IMG_WIDTH,
    files.length,
    gridContainerRef.current,
    width,
  ]);

  function deleteImage(imageIndex: number) {
    const newFiles = [...files];
    newFiles.splice(imageIndex, 1);
    onChange(newFiles);
  }

  return (
    <>
      {/* <Button
        variant="outlined"
        onClick={() => setIsHalfSize(!isHalfSize)}
        text={isHalfSize ? 'Larger' : 'Smaller'}
        className="mb-4"
      /> */}

      <div ref={gridContainerRef}>
        <GridContextProvider onChange={onDragEnd}>
          <GridDropZone
            id="pages"
            boxesPerRow={dragdropSizing.pagesPerRow}
            rowHeight={PAGE_CONTAINER_HEIGHT + PAGES_SPACING}
            style={{
              height: dragdropSizing.containerHeight,
            }}
          >
            {files.map((file, index) => (
              <GridItem
                key={file.file?.name ?? file.url ?? index}
                style={{
                  height: PAGE_CONTAINER_HEIGHT + PAGES_SPACING,
                  width: PAGE_IMG_WIDTH + PAGES_SPACING,
                }}
                onMouseEnter={() => setHoveredPageNum(index)}
                onMouseLeave={() => setHoveredPageNum(undefined)}
                className="flex justify-center items-center"
                onClick={() => {
                  if (isDragging.current || Date.now() - lastDragEndTime.current < 200)
                    return;
                  setFullSizeImage(file);
                }}
                onDragStart={() => (isDragging.current = true)}
              >
                <IconButton
                  onClick={e => {
                    deleteImage(index);
                    e.stopPropagation();
                  }}
                  icon={MdDelete}
                  color="error"
                  className={`
                    absolute top-1 right-1 
                    ${isMobile || hoveredPageNum === index ? 'visible' : 'invisible'}
                  `}
                />
                <div className="h-full flex flex-col items-center justify-center hover:cursor-move">
                  <img
                    src={getImgSource(file, randomString)}
                    height={PAGE_IMG_HEIGHT}
                    style={{
                      objectFit: 'cover',
                      maxHeight: PAGE_IMG_HEIGHT,
                      maxWidth: PAGE_IMG_WIDTH,
                    }}
                    draggable={false}
                    alt={file.file?.name || file.url}
                  />
                  <p
                    className="whitespace-pre-wrap break-all overflow-ellipsis overflow-hidden leading-none"
                    style={{ height: PAGE_NAME_HEIGHT, width: PAGE_IMG_WIDTH }}
                  >
                    <span className="mr-1">
                      <b>{index + 1}</b>
                    </span>
                    <span className="text-xs">
                      {formatPageSource(file.file?.name ?? file.url)}
                    </span>
                  </p>
                </div>
              </GridItem>
            ))}
          </GridDropZone>
        </GridContextProvider>
      </div>

      {fullSizeImage && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setFullSizeImage(undefined)}
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

function formatPageSource(pageSource: string | undefined) {
  if (!pageSource) return '';
  // Formats urls with xxxxx/0001.jpg to 0001. Otherwise, return the url as is.
  const match = pageSource.match(/\/(\d{1,4})\./);
  if (!match) return pageSource;
  return match[1];
}
