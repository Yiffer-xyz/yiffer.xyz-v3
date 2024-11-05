import { useMemo, useRef, useState } from 'react';
import type { ReactCropperElement } from 'react-cropper';
import Cropper from 'react-cropper';
import { MdArrowBack, MdCheck } from 'react-icons/md';
import type { ComicImage } from '~/utils/general';
import useWindowSize from '~/utils/useWindowSize';
import Button from '~/ui-components/Buttons/Button';
import InfoBox from '~/ui-components/InfoBox';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';

export interface ThumbnailCropperProps {
  image: ComicImage;
  minWidth: number;
  minHeight: number;
  idealWidth?: number;
  onComplete: (croppedThumbnail: ComicImage) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export default function ThumbnailCropper({
  minHeight,
  minWidth,
  idealWidth,
  onClose,
  onComplete,
  image,
  isLoading,
}: ThumbnailCropperProps) {
  const cropperRef = useRef<ReactCropperElement | null>(null);
  const [currentCropEvent, setCurrentCropEvent] = useState<Cropper.CropEvent | null>(
    null
  );
  const [isTooSmall, setIsTooSmall] = useState(false);
  const [isSmallerThanIdeal, setIsSmallerThanIdeal] = useState(false);
  const [cropResult, setCropResult] = useState<ComicImage>();

  const { isMobile, isLgUp, isXlUp, isMdUp } = useWindowSize();
  const [mobileStep, setMobileStep] = useState(1);

  const aspectRatio = minWidth / minHeight;

  const step1Width = useMemo(() => {
    if (isXlUp) return 500;
    if (isLgUp) return 400;
    return 340;
  }, [isLgUp, isXlUp]);

  const step2Width = useMemo(() => {
    if (isLgUp) return 300;
    if (isMdUp) return 230;
    return 300;
  }, [isLgUp, isMdUp]);

  const step1Height = 480;

  function onCropAreaChange(e: Cropper.CropEvent) {
    setIsTooSmall(false);
    setIsSmallerThanIdeal(false);
    setCurrentCropEvent(e);
  }

  async function onCrop() {
    if (!currentCropEvent || !cropperRef?.current) {
      return;
    }
    const width = currentCropEvent.detail.width;
    if (width < minWidth) {
      setIsTooSmall(true);
      setCropResult(undefined);
      return;
    }
    if (idealWidth && width < idealWidth) {
      setIsSmallerThanIdeal(true);
    }

    setIsTooSmall(false);
    const cropper = cropperRef?.current?.cropper;
    const base64 = cropper.getCroppedCanvas().toDataURL();
    const file = await new Promise<File>(resolve => {
      cropper.getCroppedCanvas().toBlob((blob: Blob | null) => {
        if (blob) {
          resolve(new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' }));
        }
      });
    });
    setCropResult({ base64, file });
    setMobileStep(2);
  }

  return (
    <>
      <div className="fixed inset-0 z-10 bg-black bg-opacity-50 dark:bg-opacity-80" />
      <div className="fixed inset-0 z-20 flex items-center justify-center mx-4">
        <div className="bg-white dark:bg-gray-300 rounded-lg shadow-lg p-4 w-auto sm:w-full lg:max-w-4xl xl:max-w-5xl flex flex-col">
          {!isMobile && <p className="text-xl mb-2 text-center">Crop thumbnail</p>}
          <div className="flex flex-col sm:flex-row">
            {(!isMobile || mobileStep === 1) && (
              <div className="flex flex-col items-center w-full sm:w-1/2 gap-2">
                <p>
                  <b>Crop image</b>
                </p>
                <Cropper
                  src={image.base64 ?? image.url}
                  style={{ height: step1Height, width: step1Width }}
                  aspectRatio={aspectRatio}
                  guides={false}
                  ref={cropperRef}
                  background={false}
                  viewMode={1}
                  minCanvasWidth={200}
                  crop={e => onCropAreaChange(e)}
                />
                {isTooSmall && isMobile && (
                  <InfoBox
                    variant="error"
                    centerText
                    text={`Too small!`}
                    style={{ width: step1Width }}
                  >
                    {currentCropEvent?.detail && (
                      <p>
                        minimum {minWidth}px wide, currently{' '}
                        {Math.floor(currentCropEvent.detail.width)}px.
                      </p>
                    )}
                  </InfoBox>
                )}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={onCrop}
                  text="Crop"
                  className="mt-1 mb-0.5"
                  style={{ width: step1Width }}
                />
                <Button
                  variant={'outlined'}
                  color="primary"
                  onClick={onClose}
                  text="Cancel"
                  style={{ width: step1Width }}
                />
              </div>
            )}

            {(!isMobile || mobileStep === 2) && (
              <div className="flex flex-col items-center gap-2 w-full sm:w-1/2">
                <p>
                  <b>Preview and confirm</b>
                </p>
                {cropResult && (
                  <>
                    <img
                      src={cropResult.base64}
                      alt="cropped"
                      style={{ width: step2Width }}
                    />

                    {isSmallerThanIdeal && idealWidth && currentCropEvent?.detail && (
                      <InfoBox
                        variant="warning"
                        className="my-2"
                        disableElevation
                        style={{ width: step2Width }}
                      >
                        <p>Smaller than ideal!</p>
                        <p className="mt-4">
                          Recommended width is {idealWidth}px, currently{' '}
                          {Math.floor(currentCropEvent.detail.width)}px.
                        </p>
                        <p className="mt-4">
                          You can still submit, but on most phones and laptops your ad
                          will appear in slightly lower quality.
                        </p>
                      </InfoBox>
                    )}

                    {isMobile && (
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => setMobileStep(1)}
                        text="Back"
                        startIcon={MdArrowBack}
                        style={{ width: step2Width }}
                      />
                    )}

                    <LoadingButton
                      variant="contained"
                      color="primary"
                      text="Confirm crop"
                      startIcon={MdCheck}
                      onClick={() => onComplete(cropResult)}
                      style={{ width: step2Width }}
                      isLoading={isLoading ?? false}
                    />
                  </>
                )}
                {isTooSmall && !isMobile && (
                  <InfoBox variant="error" text={`Too small!`}>
                    {currentCropEvent?.detail && (
                      <p>
                        minimum {minWidth}px wide, currently{' '}
                        {Math.floor(currentCropEvent.detail.width)}px.
                      </p>
                    )}
                  </InfoBox>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
