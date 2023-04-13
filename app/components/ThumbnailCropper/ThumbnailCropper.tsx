import { useMemo, useRef, useState } from 'react';
import Cropper, { ReactCropperElement } from 'react-cropper';
import { MdArrowBack, MdCheck } from 'react-icons/md';
import useWindowSize from '~/utils/useWindowSize';
import Button from '../Buttons/Button';
import InfoBox from '../InfoBox';

export type CroppedThumbnail = {
  base64: string;
  file: File;
};

export interface ThumbnailCropperProps {
  imageSrc: string;
  onComplete: (croppedThumbnail: CroppedThumbnail) => void;
  onClose: () => void;
}

export default function ThumbnailCropper({
  onClose,
  onComplete,
  imageSrc,
}: ThumbnailCropperProps) {
  const cropperRef = useRef<HTMLImageElement | ReactCropperElement | null>(null);
  const [currentCropEvent, setCurrentCropEvent] = useState<Cropper.CropEvent | null>(
    null
  );
  const [isTooSmall, setIsTooSmall] = useState(false);
  const [cropResult, setCropResult] = useState<CroppedThumbnail>();

  const { isMobile, isLgUp, isXlUp, isMdUp } = useWindowSize();
  const [mobileStep, setMobileStep] = useState(1);

  const step1Width = useMemo(() => {
    if (isXlUp) return 500;
    if (isLgUp) return 400;
    return 340;
  }, [isLgUp, isXlUp]);

  const step2Width = useMemo(() => {
    if (isLgUp) return 300;
    if (isMdUp) return 230;
    return 300;
  }, [isLgUp, isXlUp]);

  const step1Height = 480;

  function onCropAreaChange(e: Cropper.CropEvent) {
    setIsTooSmall(false);
    setCurrentCropEvent(e);
  }

  async function onCrop() {
    if (!currentCropEvent || !cropperRef?.current) {
      return;
    }
    const width = currentCropEvent.detail.width;
    const height = currentCropEvent.detail.height;
    if (width < 400 || height < 564) {
      setIsTooSmall(true);
      setCropResult(undefined);
      return;
    }

    setIsTooSmall(false);
    // any because the types don't seem to match reality
    const imageElement: any = cropperRef?.current;
    const cropper: any = imageElement?.cropper;
    const base64 = cropper.getCroppedCanvas().toDataURL();
    const file = await new Promise<File>(resolve => {
      cropper.getCroppedCanvas().toBlob((blob: Blob | null) => {
        if (blob) {
          resolve(new File([blob], 'thumbnail.png', { type: 'image/png' }));
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
        <div className="bg-white dark:bg-gray-300 rounded-lg shadow-lg p-4 w-full lg:max-w-4xl xl:max-w-5xl flex flex-col">
          {!isMobile && <p className="text-xl mb-2 text-center">Crop thumbnail</p>}
          <div className="flex flex-col sm:flex-row">
            {(!isMobile || mobileStep === 1) && (
              <div className="flex flex-col items-center w-full sm:w-1/2 gap-2">
                <p>Crop image</p>
                <Cropper
                  src={imageSrc}
                  style={{ height: step1Height, width: step1Width }}
                  aspectRatio={400 / 564}
                  guides={false}
                  ref={cropperRef}
                  background={false}
                  viewMode={1}
                  minCanvasWidth={400}
                  crop={e => onCropAreaChange(e)}
                />
                {isTooSmall && isMobile && (
                  <InfoBox
                    variant="error"
                    centerText
                    text={`Too small!`}
                    style={{ width: step1Width }}
                  />
                )}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={onCrop}
                  text="Crop"
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
                <p>Preview and confirm</p>
                {cropResult && (
                  <>
                    <img
                      src={cropResult.base64}
                      alt="cropped image"
                      style={{ width: step2Width }}
                    />
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
                    <Button
                      variant="contained"
                      color="primary"
                      text="Confirm crop"
                      startIcon={MdCheck}
                      onClick={() => onComplete(cropResult)}
                      style={{ width: step2Width }}
                    />
                  </>
                )}
                {isTooSmall && !isMobile && (
                  <InfoBox variant="error" text={`Too small!`}>
                    {currentCropEvent?.detail && (
                      <p>
                        minimum 400px, currently{' '}
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
