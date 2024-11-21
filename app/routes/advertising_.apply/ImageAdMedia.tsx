import { useState } from 'react';
import type { AdvertisementInfo } from '~/types/types';
import type { ComicImage } from '~/utils/general';
import { getFilesWithBase64 } from '~/utils/general';
import FileInput from '~/ui-components/FileInput';
import ThumbnailCropper from '~/page-components/ThumbnailCropper/ThumbnailCropper';
import { MdCheckCircle } from 'react-icons/md';
import InfoBox from '~/ui-components/InfoBox';

type Props = {
  ad: AdvertisementInfo;
  selectedFile?: ComicImage | undefined;
  setSelectedFile: (newFile: ComicImage | undefined) => void;
  setCroppedFile: (newFile: ComicImage | undefined) => void;
};

export default function ImageAdMedia({
  ad,
  selectedFile,
  setSelectedFile,
  setCroppedFile,
}: Props) {
  const [isGif, setIsGif] = useState<boolean>(false);
  const [fileToCrop, setFileToCrop] = useState<ComicImage | undefined>();
  const [isFileCorrectDimensions, setIsFileCorrectDimensions] = useState<boolean>(false);

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files) return;

    const isGif = event.target.files[0].type.endsWith('gif');
    if (isGif) {
      setSelectedFile(undefined);
      setIsGif(true);
      return;
    }
    processImageFile(event.target.files);
  }

  async function processImageFile(fileInput: FileList) {
    const filesWithString = await getFilesWithBase64(fileInput);
    if (filesWithString.length === 0) {
      setSelectedFile(undefined);
      return;
    }

    const file = filesWithString[0];
    if (file.file?.type && file.file.type.startsWith('image/')) {
      const acceptedDimensions = [ad.minDimensions];
      if (ad.idealDimensions) acceptedDimensions.push(ad.idealDimensions);

      const isCorrectDimensions = await isImageCorrectDimensions({
        file: file.file,
        acceptedDimensions,
      });

      if (isCorrectDimensions) {
        setIsFileCorrectDimensions(true);
      } else {
        setFileToCrop(file);
      }
    }

    setSelectedFile(file);
  }

  function onCropFinished(croppedThumb: ComicImage) {
    setCroppedFile(croppedThumb);
    setFileToCrop(undefined);
  }

  function onCropCancel() {
    setFileToCrop(undefined);
    setSelectedFile(undefined);
  }

  return (
    <div>
      {ad.idealDimensions ? (
        <>
          <p>
            Ideal dimensions: {ad.idealDimensions.width} x {ad.idealDimensions.height} or
            more
          </p>
          <p>
            Min dimensions: {ad.minDimensions.width} x {ad.minDimensions.height}
          </p>
          <p>
            Submitting smaller than ideal dimensions will lead to a lower quality
            appearance on most screens.
          </p>
        </>
      ) : (
        <p>
          Dimensions: {ad.minDimensions.width} x {ad.minDimensions.height} or more. The
          uploaded file can be cropped in the browser.
        </p>
      )}

      <FileInput onChange={onFileChange} accept="image/*" style={{ marginTop: 8 }} />
      {selectedFile && (
        <p className="mt-2">
          Selected file: <b>{selectedFile.file?.name}</b>
        </p>
      )}
      {isFileCorrectDimensions && (
        <div className="flex flex-row items-center">
          <MdCheckCircle className="text-theme2-darker mr-1 mt-0.5" />
          <p>
            <b>File dimensions are correct</b>
          </p>
        </div>
      )}

      {fileToCrop && (
        <ThumbnailCropper
          minHeight={ad.minDimensions.height}
          minWidth={ad.minDimensions.width}
          idealWidth={ad.idealDimensions?.width}
          image={fileToCrop}
          onClose={onCropCancel}
          onComplete={onCropFinished}
        />
      )}

      {isGif && (
        <InfoBox
          variant="error"
          boldText={false}
          text="For submitting gif files, go back and select GIF"
          fitWidth
          className="mt-4"
        />
      )}
    </div>
  );
}

async function isImageCorrectDimensions({
  file,
  acceptedDimensions,
}: {
  file: File;
  acceptedDimensions: { width: number; height: number }[];
}) {
  return new Promise<boolean>(resolve => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      const tempImage = new Image();
      // @ts-ignore
      tempImage.src = fileReader.result;
      tempImage.onload = () => {
        const isCorrect = acceptedDimensions.some(
          dim => tempImage.width === dim.width && tempImage.height === dim.height
        );
        resolve(isCorrect);
      };
    };

    fileReader.readAsDataURL(file);
  });
}
