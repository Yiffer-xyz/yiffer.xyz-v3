import { useRef, useState } from 'react';
import Cropper from 'react-cropper';
import { MdArrowBack, MdCheck } from 'react-icons/md';
import useWindowSize from '~/utils/useWindowSize';
import Button from '../Buttons/Button';
import InfoBox from '../InfoBox';

export interface ThumbnailCropperProps {
  imageSrc: string;
  onComplete: (croppedImageB64: string) => void;
  onClose: () => void;
}

export default function ThumbnailCropper({ onClose, onComplete, imageSrc }: ThumbnailCropperProps) {
  const cropperRef = useRef<HTMLImageElement>(null);
  const [currentCropEvent, setCurrentCropEvent] = useState<Cropper.CropEvent | null>(null);
  const [isTooSmall, setIsTooSmall] = useState(false);
  const [cropResult, setCropResult] = useState<string>();

  const { isMobile } = useWindowSize();
  const [mobileStep, setMobileStep] = useState(1);

  function onCropAreaChange(e: Cropper.CropEvent) {
    setIsTooSmall(false);
    setCurrentCropEvent(e);
  }

  function onCrop() {
    if (!currentCropEvent || !cropperRef?.current) {
      return;
    }
    const width = currentCropEvent.detail.width;
    const height = currentCropEvent.detail.height;
    if (width < 200 || height < 282) {
      setIsTooSmall(true);
      setCropResult(undefined);
      return;
    }

    setIsTooSmall(false);
    const imageElement: any = cropperRef?.current;
    const cropper: any = imageElement?.cropper;
    setCropResult(cropper.getCroppedCanvas().toDataURL());
    setMobileStep(2);
  }

  return (
    <>
      <div className="fixed inset-0 z-10 bg-black bg-opacity-50 dark:bg-opacity-80" />
      <div className="fixed inset-0 z-20 flex items-center justify-center mx-4">
        <div className="bg-white dark:bg-gray-300 rounded-lg shadow-lg p-4 max-w-2xl w-full flex flex-col">
          {!isMobile && <p className="text-xl mb-2 text-center">Crop thumbnail</p>}
          <div className="flex flex-col sm:flex-row">
            {(!isMobile || mobileStep === 1) && (
              <div className="flex flex-col items-center w-full sm:w-1/2 gap-2">
                <p>Crop image</p>
                <Cropper
                  src={imageSrc}
                  style={{ height: 400, width: 284 }}
                  aspectRatio={200 / 282}
                  guides={false}
                  ref={cropperRef}
                  background={false}
                  viewMode={1}
                  minCanvasWidth={200}
                  crop={e => onCropAreaChange(e)}
                />
                {isTooSmall && isMobile && (
                  <InfoBox variant="error" centerText text={`Too small!`} style={{ width: 284 }} />
                )}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={onCrop}
                  text="Crop"
                  style={{ width: 284 }}
                />
                <Button
                  variant={'outlined'}
                  color="primary"
                  onClick={onClose}
                  text="Cancel"
                  style={{ width: 284 }}
                />
              </div>
            )}

            {(!isMobile || mobileStep === 2) && (
              <div className="flex flex-col items-center gap-2 w-full sm:w-1/2">
                <p>Preview and confirm</p>
                {cropResult && (
                  <>
                    <img src={cropResult} alt="cropped image" style={{ width: '200px' }} />
                    {isMobile && (
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => setMobileStep(1)}
                        text="Back"
                        startIcon={MdArrowBack}
                        style={{ width: 200 }}
                      />
                    )}
                    <Button
                      variant="contained"
                      color="primary"
                      text="Confirm crop"
                      startIcon={MdCheck}
                      onClick={() => onComplete(cropResult)}
                      style={{ width: '200px' }}
                    />
                  </>
                )}
                {isTooSmall && !isMobile && (
                  <InfoBox variant="error" text={`Too small!`}>
                    {currentCropEvent?.detail && (
                      <p>minimum 200px, currently {Math.floor(currentCropEvent.detail.width)}px.</p>
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
