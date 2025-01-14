import { MdArrowBack, MdArrowForward } from 'react-icons/md';
import { ADVERTISEMENTS } from '~/types/constants';
import type { AdMediaType, AdvertisementInfo } from '~/types/types';
import Button from '~/ui-components/Buttons/Button';
import Checkbox from '~/ui-components/Checkbox/Checkbox';
import InfoBox from '~/ui-components/InfoBox';
import SelectBoxes from '~/ui-components/SelectBoxes/SelectBoxes';

type Step2MediaTypeProps = {
  isNewAd: boolean;
  adType: AdvertisementInfo | undefined;
  setAdType: (n: AdvertisementInfo) => void;
  mediaType: AdMediaType | undefined;
  setMediaType: (n: AdMediaType) => void;
  isRequestingTrial: boolean;
  setIsRequestingTrial: (n: boolean) => void;
  onBack: () => void;
  onNext: () => void;
};

export default function Step2MediaType({
  isNewAd,
  adType,
  setAdType,
  mediaType,
  setMediaType,
  isRequestingTrial,
  setIsRequestingTrial,
  onBack,
  onNext,
}: Step2MediaTypeProps) {
  return (
    <>
      <p className="font-semibold text-lg mb-2">Step 2: Ad type</p>

      <p className="font-bold mb-2">Media type</p>

      <SelectBoxes
        fullWidthMobile
        value={mediaType}
        onChange={setMediaType}
        options={[
          {
            text: 'Image',
            value: 'image',
            description: 'Can be resized in the editor',
          },
          { text: 'GIF', value: 'gif', description: 'Must be exact size' },
          { text: 'Video', value: 'video', description: 'Must be exact size' },
        ]}
      />

      {(mediaType === 'video' || mediaType === 'gif') && (
        <p className="mt-2">
          {mediaType === 'video' ? 'Videos' : 'GIFs'} cannot be resized in the editor. You
          must ensure your ad is of the correct dimensions before uploading.
          {mediaType === 'video' && ' We accept mp4 and webm files only.'}
        </p>
      )}

      <p className="font-bold mb-2 mt-8">Ad type</p>

      <SelectBoxes
        fullWidthMobile
        equalWidth
        value={adType}
        onChange={setAdType}
        options={ADVERTISEMENTS.map(ad => ({
          text: ad.title,
          value: ad,
          description: ad.description,
          children: (
            <p className="text-sm mt-1">
              <b>${ad.pricesForMonths[1]}</b> per month
            </p>
          ),
        }))}
      />

      <p className="font-bold mb-2 mt-8">Free trial</p>
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
              You will receive an email once your trial submission is approved. We will
              still require payment details at that point, but you can very easily cancel
              the subscription at any time and you will not be charged during the first 30
              days. Alternatively, if you are not approved for the free trial, you will be
              informed via email.
            </p>
          </>
        </InfoBox>
      )}

      <div className="mt-8 self-end flex flex-row gap-2">
        <Button
          text={isNewAd ? 'Back' : 'Cancel editing'}
          startIcon={isNewAd ? MdArrowBack : undefined}
          onClick={onBack}
          variant="outlined"
          disableElevation
        />

        <Button
          text="Next: Details"
          onClick={onNext}
          disableElevation
          disabled={!mediaType || !adType}
          endIcon={MdArrowForward}
        />
      </div>
    </>
  );
}
