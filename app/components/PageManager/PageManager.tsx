import { GridContextProvider, GridDropZone, GridItem, swap } from 'react-grid-dnd';
import { useMemo, useRef, useState } from 'react';
import useWindowSize from '~/utils/useWindowSize';
import { ComicImage } from '~/utils/general';
import { MdDelete } from 'react-icons/md';
import IconButton from '../Buttons/IconButton';
import Button from '../Buttons/Button';

const RATIO = Math.round(400 / 564);
const PAGE_NAME_HEIGHT = 40;
const PAGES_SPACING = 4;

type PageManagerProps = {
  files: ComicImage[];
  onChange: (newFiles: ComicImage[]) => void;
};

export default function PageManager({ files, onChange }: PageManagerProps) {
  const gridContainerRef = useRef<any>();
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

  function onDragEnd(_: any, sourceIndex: number, targetIndex: number) {
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
  }, [width, files, PAGE_IMG_HEIGHT]);

  function deleteImage(imageIndex: number) {
    const newFiles = [...files];
    newFiles.splice(imageIndex, 1);
    onChange(newFiles);
  }

  return (
    <>
      <Button
        variant="outlined"
        onClick={() => setIsHalfSize(!isHalfSize)}
        text={isHalfSize ? 'Larger' : 'Smaller'}
        className="mb-2"
      />

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
                key={file.file?.name || file.url || index}
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
                  onClick={() => deleteImage(index)}
                  icon={MdDelete}
                  color="error"
                  className={`
                    absolute top-1 right-1 
                    ${isMobile || hoveredPageNum === index ? 'visible' : 'invisible'}
                  `}
                />
                <div className="h-full flex flex-col items-center justify-center hover:cursor-move">
                  <img
                    src={file.url || file.base64}
                    height={PAGE_IMG_HEIGHT}
                    style={{
                      objectFit: 'cover',
                      maxHeight: PAGE_IMG_HEIGHT,
                      maxWidth: PAGE_IMG_WIDTH,
                    }}
                    draggable={false}
                  />
                  <p
                    className="whitespace-pre-wrap break-all overflow-ellipsis overflow-hidden leading-none"
                    style={{ height: PAGE_NAME_HEIGHT, width: PAGE_IMG_WIDTH }}
                  >
                    <span className="mr-1">
                      <b>{index + 1}</b>
                    </span>
                    <span className="text-xs">{file.file?.name || file.url}</span>
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
          />
        </div>
      )}
    </>
  );
}
