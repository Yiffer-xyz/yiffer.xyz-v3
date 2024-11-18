import { useState, useEffect, useCallback } from 'react';
import IconButton from '../Buttons/IconButton';
import { MdArrowBack, MdArrowForward } from 'react-icons/md';

export default function ImageCarousel({
  images,
  height,
  title,
  description,
}: {
  images: { source: string; description: string }[];
  height: number;
  title?: string;
  description?: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const handlePrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => Math.min(images.length - 1, prev + 1));
  }, [images.length]);

  const handleClose = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, isOpen]);

  return (
    <>
      <div className="w-fit">
        {(title || description) && (
          <div className="flex flex-col items-center mb-1">
            {title && <p className="text-lg font-bold text-center">{title}</p>}
            {description && <p className="text-center">{description}</p>}
          </div>
        )}

        <div className="relative flex items-center gap-2 w-fit">
          <IconButton
            icon={MdArrowBack}
            onClick={handlePrevious}
            variant="naked"
            disabled={currentIndex === 0}
          />

          <div className="flex flex-col items-center flex-1 min-w-0">
            <img
              src={images[currentIndex].source}
              alt={images[currentIndex].description}
              style={{ maxHeight: height }}
              className="cursor-pointer object-contain w-full"
              onClick={() => setIsOpen(true)}
            />
            <p className="mt-1 text-center italic px-2">
              {images[currentIndex].description}
            </p>
          </div>

          <IconButton
            icon={MdArrowForward}
            onClick={handleNext}
            variant="naked"
            disabled={currentIndex === images.length - 1}
          />
        </div>
      </div>

      {/* Fullscreen view */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={handleClose}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <div className="absolute left-1 md:left-4 top-1/2 -translate-y-2">
              <IconButton
                icon={MdArrowBack}
                onClick={e => {
                  e.stopPropagation();
                  handlePrevious();
                }}
                disabled={currentIndex === 0}
              />
            </div>

            <img
              src={images[currentIndex].source}
              alt={images[currentIndex].description}
              className="max-h-[90vh] max-w-[90vw] object-contain"
            />

            <div className="absolute right-1 md:right-4 top-1/2 -translate-y-2">
              <IconButton
                icon={MdArrowForward}
                onClick={e => {
                  e.stopPropagation();
                  handleNext();
                }}
                disabled={currentIndex === images.length - 1}
              />
            </div>
          </div>

          <div className="absolute bottom-8 left-0 w-full flex justify-center">
            <div
              className="bg-black/65 py-1 px-2 text-white rounded-xl text-sm font-bold
              border border-theme1-primary max-w-[90vw]"
            >
              {images[currentIndex].description}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
