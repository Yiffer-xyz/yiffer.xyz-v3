import { useMemo, useState } from 'react';
import { MdArrowBack, MdCheckCircle, MdClose } from 'react-icons/md';
import ThumbnailCropper from '~/page-components/ThumbnailCropper/ThumbnailCropper';
import {
  ADVERTISEMENTS,
  CARD_AD_MAIN_TEXT_MAX_LENGTH,
  CARD_AD_SECONDARY_TEXT_MAX_LENGTH,
} from '~/types/constants';
import type { AdvertisementInfo } from '~/types/types';
import Button from '~/ui-components/Buttons/Button';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import Checkbox from '~/ui-components/Checkbox/Checkbox';
import FileInput from '~/ui-components/FileInput';
import InfoBox from '~/ui-components/InfoBox';
import Select from '~/ui-components/Select/Select';
import TextInput from '~/ui-components/TextInput/TextInput';
import type { ComicImage } from '~/utils/general';
import { getFilesWithBase64 } from '~/utils/general';

const adTypeOptions = ADVERTISEMENTS.map(ad => ({ text: ad.title, value: ad }));

type Step2DetailsProps = {
  isNewAd: boolean;
  adType: AdvertisementInfo | undefined;
  setAdType?: (n: AdvertisementInfo) => void;
  isRequestingTrial?: boolean;
  setIsRequestingTrial?: (n: boolean) => void;
  link: string;
  setLink: (n: string) => void;
  adName: string;
  setAdName: (n: string) => void;
  mainText?: string;
  setMainText?: (n: string) => void;
  secondaryText?: string;
  setSecondaryText?: (n: string) => void;
  notesComments?: string;
  setNotesComments?: (n: string) => void;
  selectedFile?: ComicImage | undefined;
  setSelectedFile: (newFile: ComicImage | undefined) => void;
  setCroppedFile: (newFile: ComicImage | undefined) => void;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  submitError?: string | null | undefined;
};

export default function Step2Details({
  isNewAd,
  adType,
  setAdType,
  onSubmit,
  onBack,
  adName,
  isRequestingTrial,
  setIsRequestingTrial,
  link,
  mainText,
  secondaryText,
  selectedFile,
  setAdName,
  notesComments,
  setNotesComments,
  setLink,
  setMainText,
  setSecondaryText,
  setSelectedFile,
  setCroppedFile,
  isSubmitting,
  submitError,
}: Step2DetailsProps) {
  const [isFileCorrectDimensions, setIsFileCorrectDimensions] = useState<boolean>(false);
  const [fileToCrop, setFileToCrop] = useState<ComicImage | undefined>();

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (!adType) return;
    if (event.target.files) {
      const filesWithString = await getFilesWithBase64(event.target.files);
      if (filesWithString.length === 0) {
        setSelectedFile(undefined);
        return;
      }

      const file = filesWithString[0];
      if (file.file?.type && file.file.type.startsWith('image/')) {
        const acceptedDimensions = [adType.minDimensions];
        if (adType.idealDimensions) acceptedDimensions.push(adType.idealDimensions);

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
  }

  function onCropFinished(croppedThumb: ComicImage) {
    setCroppedFile(croppedThumb);
    setFileToCrop(undefined);
  }

  function onCropCancel() {
    setFileToCrop(undefined);
    setSelectedFile(undefined);
  }

  function onAdTypeChosen(adType: AdvertisementInfo) {
    if (!setAdType) return;
    setAdType(adType);
    setSelectedFile(undefined);
    setFileToCrop(undefined);
    setCroppedFile(undefined);
  }

  const mainTextCharsLeft = CARD_AD_MAIN_TEXT_MAX_LENGTH - (mainText?.length ?? 0);
  const secondaryTextCharsLeft =
    CARD_AD_SECONDARY_TEXT_MAX_LENGTH - (secondaryText?.length ?? 0);

  const canSubmit = useMemo(() => {
    if (!adType || !link || !adName) return false;
    if (adType.name === 'card') {
      if (!mainText || mainText.length < 2) return false;
      if (
        mainText.length > CARD_AD_MAIN_TEXT_MAX_LENGTH ||
        (secondaryText && secondaryText.length > CARD_AD_SECONDARY_TEXT_MAX_LENGTH)
      ) {
        return false;
      }
    }

    return true;
  }, [adType, link, adName, mainText, secondaryText]);

  return (
    <>
      {isNewAd && (
        <>
          <Checkbox
            label="Request one month free trial"
            checked={!!isRequestingTrial}
            onChange={setIsRequestingTrial ?? (() => null)}
          />

          {isRequestingTrial && (
            <InfoBox
              variant="info"
              boldText={false}
              disableElevation
              showIcon
              className="mt-4"
              fitWidth
            >
              <>
                <p>
                  Only one free trial ad per user. Free trials are only awarded to{' '}
                  <i>creators</i> of furry-related content.
                </p>
                <p className="mt-4">
                  You will receive an email once your trial submission is approved. We
                  will still require payment details at that point, but you can very
                  easily cancel the subscription at any time and you will not be charged
                  during the first 30 days. Alternatively, if you are not approved for the
                  free trial, you will be informed via email.
                </p>
              </>
            </InfoBox>
          )}
        </>
      )}

      {isNewAd && (
        <Select
          name="Ad type"
          title="Ad type"
          onChange={onAdTypeChosen}
          value={adType}
          options={adTypeOptions}
          className="mt-6"
        />
      )}

      {adType && (
        <>
          {isNewAd && (
            <>
              <p className="text-sm mt-2">{adType.description}</p>
              <p className="text-sm mt-1">
                <b>${adType.pricesForMonts[1]}</b> per month.
              </p>
            </>
          )}

          <TextInput
            label="Link"
            placeholder="https://example.com"
            value={link}
            onChange={setLink}
            name="link"
            className="mt-6"
          />

          <TextInput
            label="Ad name (just for your own sake, to keep track)"
            placeholder="My first ad"
            value={adName}
            onChange={setAdName}
            name="adName"
            className="mt-12"
          />

          {adType.hasTexts && (
            <>
              <TextInput
                label="Main text"
                value={mainText ?? ''}
                onChange={setMainText ?? (() => null)}
                name="mainText"
                className="mt-12"
                helperText={`${mainTextCharsLeft} left`}
                error={mainTextCharsLeft < 0}
              />

              <TextInput
                label="Secondary text"
                value={secondaryText ?? ''}
                onChange={setSecondaryText ?? (() => null)}
                name="secondaryText"
                className="mt-16"
                helperText={`${secondaryTextCharsLeft} left`}
                error={secondaryTextCharsLeft < 0}
              />
            </>
          )}

          <p className="font-bold mt-12">File</p>
          {adType.idealDimensions ? (
            <>
              <p className="text-sm">
                Ideal dimensions: {adType.idealDimensions.width} x{' '}
                {adType.idealDimensions.height} or more
              </p>
              <p className="text-sm">
                Min dimensions: {adType.minDimensions.width} x{' '}
                {adType.minDimensions.height}
              </p>
              <p className="text-sm">
                Submitting non-ideal dimensions will lead to a lower quality appearance on
                most screens.
              </p>
            </>
          ) : (
            <p className="text-sm">
              Min dimensions: {adType.minDimensions.width} x {adType.minDimensions.height}
            </p>
          )}

          <p className="text-sm">Images can be cropped after upload.</p>

          <FileInput
            onChange={onFileChange}
            accept="image/*,video/*"
            style={{ marginTop: 8 }}
          />
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
              minHeight={adType.minDimensions.height}
              minWidth={adType.minDimensions.width}
              idealWidth={adType.idealDimensions?.width}
              image={fileToCrop}
              onClose={onCropCancel}
              onComplete={onCropFinished}
            />
          )}

          <TextInput
            label="Notes or comments for our admins"
            value={notesComments ?? ''}
            onChange={setNotesComments ?? (() => null)}
            name="notesComments"
            className="mt-8"
          />

          {submitError && (
            <InfoBox
              variant="error"
              text={submitError}
              className="mt-6"
              showIcon
              closable
              disableElevation
            />
          )}

          <div className="mt-8 self-end flex flex-row gap-2">
            <Button
              text={isNewAd ? 'Back' : 'Cancel editing'}
              startIcon={isNewAd ? MdArrowBack : MdClose}
              onClick={onBack}
              variant="outlined"
              disableElevation
            />

            <LoadingButton
              text={isNewAd ? 'Submit ad' : 'Save changes'}
              isLoading={isSubmitting}
              onClick={onSubmit}
              disabled={!canSubmit}
              disableElevation
            />
          </div>
        </>
      )}
    </>
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
