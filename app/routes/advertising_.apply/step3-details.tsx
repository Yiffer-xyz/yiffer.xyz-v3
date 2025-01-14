import { useMemo } from 'react';
import { MdArrowBack } from 'react-icons/md';
import {
  CARD_AD_MAIN_TEXT_MAX_LENGTH,
  CARD_AD_SECONDARY_TEXT_MAX_LENGTH,
} from '~/types/constants';
import type { AdMediaType, AdvertisementInfo } from '~/types/types';
import Button from '~/ui-components/Buttons/Button';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import InfoBox from '~/ui-components/InfoBox';
import TextInput from '~/ui-components/TextInput/TextInput';
import type { ComicImage } from '~/utils/general';
import { capitalizeFirstRestLower } from '~/utils/general';
import ImageAdMedia from './ImageAdMedia';
import VideoOrGifAdMedia from './VideoOrGifAdMedia';

type Step3DetailsProps = {
  isNewAd: boolean;
  adType: AdvertisementInfo;
  mediaType: AdMediaType;
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

export default function Step3Details({
  isNewAd,
  adType,
  mediaType,
  onSubmit,
  onBack,
  adName,
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
}: Step3DetailsProps) {
  const mainTextCharsLeft = CARD_AD_MAIN_TEXT_MAX_LENGTH - (mainText?.length ?? 0);
  const secondaryTextCharsLeft =
    CARD_AD_SECONDARY_TEXT_MAX_LENGTH - (secondaryText?.length ?? 0);

  const canSubmit = useMemo(() => {
    if (!adType || !link || !adName) return false;
    if (!selectedFile && isNewAd) return false;
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
  }, [adType, link, adName, selectedFile, isNewAd, mainText, secondaryText]);

  return (
    <>
      <TextInput
        label="Link"
        placeholder="https://example.com"
        value={link}
        onChange={setLink}
        name="link"
        className="mt-2"
        helperText='Must start with "http://" or "https://"'
      />

      <TextInput
        label="Ad name (for your own sake, to keep track)"
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

      <p className="font-bold mt-12">{capitalizeFirstRestLower(mediaType)} file</p>

      {mediaType === 'image' ? (
        <ImageAdMedia
          ad={adType}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          setCroppedFile={setCroppedFile}
        />
      ) : (
        <VideoOrGifAdMedia
          ad={adType}
          mediaType={mediaType}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
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
          startIcon={isNewAd ? MdArrowBack : undefined}
          onClick={() => {
            setSelectedFile(undefined);
            onBack();
          }}
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
  );
}
