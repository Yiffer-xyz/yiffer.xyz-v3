import { useState } from 'react';
import { MdCheckCircle } from 'react-icons/md';
import type { AdMediaType, AdvertisementInfo } from '~/types/types';
import FileInput from '~/ui-components/FileInput';
import InfoBox from '~/ui-components/InfoBox';
import type { ComicImage } from '~/utils/general';

type Props = {
  ad: AdvertisementInfo;
  mediaType: AdMediaType;
  selectedFile: ComicImage | undefined;
  setSelectedFile: (newFile: ComicImage | undefined) => void;
};

export default function VideoOrGifAdMedia({
  ad,
  mediaType,
  selectedFile,
  setSelectedFile,
}: Props) {
  const [dimensionErrorTxt, setDimensionErrorTxt] = useState<string | null>(null);
  const [isCorrectDimensions, setIsCorrectDimensions] = useState<boolean>(false);

  async function onVideoFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    setDimensionErrorTxt(null);
    setIsCorrectDimensions(false);
    setSelectedFile(undefined);
    if (!event.target.files) return;

    const file = event.target.files[0];
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.onloadedmetadata = () => {
      const width = video.videoWidth;
      const height = video.videoHeight;
      URL.revokeObjectURL(video.src);
      verifyDimensions(width, height, file);
    };
  }

  async function onGifFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    setDimensionErrorTxt(null);
    setIsCorrectDimensions(false);
    setSelectedFile(undefined);
    if (!event.target.files) return;

    const file = event.target.files[0];
    const image = new Image();
    image.src = URL.createObjectURL(file);
    image.onload = () => {
      const width = image.width;
      const height = image.height;
      URL.revokeObjectURL(image.src);
      verifyDimensions(width, height, file);
    };
  }

  function verifyDimensions(width: number, height: number, file: File) {
    let isCorrectDimensions = false;

    // Check if dimensions are within ±1 pixel of the minimum dimensions
    if (
      Math.abs(width - ad.minDimensions.width) <= 1 &&
      Math.abs(height - ad.minDimensions.height) <= 1
    ) {
      isCorrectDimensions = true;
    }

    // Check alternative dimensions with the same ±1 pixel tolerance
    if (ad.alternativeDimensions) {
      isCorrectDimensions =
        isCorrectDimensions ||
        [...ad.alternativeDimensions].some(
          dim => Math.abs(dim.width - width) <= 1 && Math.abs(dim.height - height) <= 1
        ) ||
        (!!ad.idealDimensions &&
          Math.abs(ad.idealDimensions.width - width) <= 1 &&
          Math.abs(ad.idealDimensions.height - height) <= 1);
    }

    setIsCorrectDimensions(isCorrectDimensions);

    if (isCorrectDimensions) {
      setDimensionErrorTxt(null);
      setSelectedFile({ file });
    } else {
      setDimensionErrorTxt(
        `Dimensions are incorrect. ${width} x ${height} is not one of the accepted sizes - see above.`
      );
    }
  }

  return (
    <div>
      {ad.idealDimensions ? (
        <>
          <p>
            Ideal dimensions: {ad.idealDimensions.width} x {ad.idealDimensions.height}{' '}
            (exact)
          </p>
          <p>
            Alternative dimensions:{' '}
            {ad.alternativeDimensions
              ?.map(altDim => `${altDim.width} x ${altDim.height} (exact)`)
              .join(', ')}
          </p>
          <p>
            Submitting smaller than ideal dimensions will lead to a lower quality
            appearance on most screens.
          </p>
        </>
      ) : (
        <p>
          Dimensions: {ad.minDimensions.width} x {ad.minDimensions.height} (exact)
        </p>
      )}
      {mediaType === 'video' && <p>Accepted file formats: mp4, webm</p>}

      {mediaType === 'video' ? (
        <FileInput
          onChange={onVideoFileChange}
          accept="video/mp4,video/webm"
          style={{ marginTop: 8 }}
        />
      ) : (
        <FileInput
          onChange={onGifFileChange}
          accept="image/gif"
          style={{ marginTop: 8 }}
        />
      )}

      {selectedFile?.file && (
        <p className="mt-2">
          Selected file: <b>{selectedFile.file?.name}</b>
        </p>
      )}

      {isCorrectDimensions && (
        <div className="flex flex-row items-center">
          <MdCheckCircle className="text-theme2-darker mr-1 mt-0.5" />
          <p>
            <b>File dimensions are correct</b>
          </p>
        </div>
      )}

      {dimensionErrorTxt && !isCorrectDimensions && (
        <InfoBox
          variant="error"
          text={dimensionErrorTxt}
          disableElevation
          className="mt-4"
          boldText={false}
          fitWidth
        />
      )}
    </div>
  );
}
