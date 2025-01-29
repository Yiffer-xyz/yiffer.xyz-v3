import '~/utils/cropper.min.css';
import { useState } from 'react';
import type { AdMediaType, AdType, AdvertisementInfo } from '~/types/types';
import TopGradientBox from '~/ui-components/TopGradientBox';
import { getFileExtension, randomString, type ComicImage } from '~/utils/general';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import Breadcrumbs from '~/ui-components/Breadcrumbs/Breadcrumbs';
import Step3Details from './step3-details';
import Step1Info from './step1-info';
import type { SubmitAdFormData } from '../api.submit-ad';
import { useLoaderData } from '@remix-run/react';
import InfoBox from '~/ui-components/InfoBox';
import Link from '~/ui-components/Link';
import Step2MediaType from './step2-mediaType';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
export { YifferErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction = () => {
  return [{ title: `Advertising application | Yiffer.xyz` }];
};

export default function AdvertisingApply() {
  const { IMAGES_SERVER_URL } = useLoaderData<typeof loader>();

  const [adType, setAdType] = useState<AdvertisementInfo | undefined>();
  const [link, setLink] = useState<string>('');
  const [adName, setAdName] = useState<string>('');
  const [notesComments, setNotesComments] = useState<string>('');
  const [mainText, setMainText] = useState<string>('');
  const [secondaryText, setSecondaryText] = useState<string>('');
  const [isRequestingTrial, setIsRequestingTrial] = useState<boolean>(false);
  const [mediaType, setMediaType] = useState<AdMediaType | undefined>(undefined);

  const [selectedFile, setSelectedFile] = useState<ComicImage | undefined>();
  const [croppedFile, setCroppedFile] = useState<ComicImage | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fileSubmitErr, setFileSubmitErr] = useState<string | undefined>();

  const [step, setStep] = useState<number>(1);

  const submitFetcher = useGoodFetcher({
    url: '/api/submit-ad',
    method: 'post',
  });

  async function submitFile(adId: string, file: File, adType: AdType): Promise<boolean> {
    setFileSubmitErr(undefined);
    const formData = new FormData();

    formData.append('adFile', file, `id.${getFileExtension(file.name)}`);
    formData.append('adId', adId);
    formData.append('adType', adType);

    try {
      const res = await fetch(`${IMAGES_SERVER_URL}/submit-ad`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        setFileSubmitErr(`Error submitting file: ${text}`);
        return false;
      }
    } catch (e) {
      console.error(e);
      setFileSubmitErr('Error submitting file');
      return false;
    }

    return true;
  }

  async function onSubmit() {
    const file = croppedFile ?? selectedFile;
    if (!adType || !file?.file) return;
    setIsLoading(true);
    const id = randomString(6);

    const isSubmitOk = await submitFile(id, file.file, adType.name);
    if (!isSubmitOk) {
      setIsLoading(false);
      return;
    }

    const videoSpecificFileType = file.file.type.includes('video')
      ? getFileExtension(file.file.name)
      : null;

    const body: SubmitAdFormData = {
      id,
      isRequestingTrial,
      adName,
      adType: adType.name,
      mediaType: mediaType!,
      link,
      mainText: mainText || null,
      secondaryText: secondaryText || null,
      notesComments: notesComments || null,
      isAnimated: false,
      videoSpecificFileType,
    };

    submitFetcher.submit({ body: JSON.stringify(body) });
    setIsLoading(false);
  }

  return (
    <div className="container mx-auto mb-16">
      <h1>Ads: application</h1>

      <Breadcrumbs
        prevRoutes={[
          { text: 'Me', href: '/me' },
          { text: 'Advertising', href: '/advertising' },
        ]}
        currentRoute="Application form"
      />
      {submitFetcher.success ? (
        <InfoBox
          variant="success"
          text="Ad submitted successfully!"
          className="my-6"
          fitWidth
          boldText={false}
        >
          <Link
            href="/advertising/dashboard"
            text="Go to advertising dashboard"
            showRightArrow
            color="white"
            className="mt-2"
          />
        </InfoBox>
      ) : (
        <TopGradientBox containerClassName="mt-6" innerClassName="p-6 pt-4 flex flex-col">
          {step === 1 && <Step1Info onNext={() => setStep(2)} />}

          {step === 2 && (
            <Step2MediaType
              isNewAd
              mediaType={mediaType}
              setMediaType={setMediaType}
              adType={adType}
              setAdType={setAdType}
              isRequestingTrial={isRequestingTrial}
              setIsRequestingTrial={setIsRequestingTrial}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          )}

          {step === 3 && (
            <>
              <p className="font-semibold text-lg mb-0">Step 3: Details</p>
              <Step3Details
                isNewAd
                adName={adName}
                setAdName={setAdName}
                mediaType={mediaType!}
                adType={adType!}
                link={link}
                setLink={setLink}
                mainText={mainText}
                setMainText={setMainText}
                secondaryText={secondaryText}
                setSecondaryText={setSecondaryText}
                notesComments={notesComments}
                setNotesComments={setNotesComments}
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}
                setCroppedFile={setCroppedFile}
                onBack={() => setStep(2)}
                onSubmit={onSubmit}
                isSubmitting={submitFetcher.isLoading || isLoading}
                submitError={fileSubmitErr ?? submitFetcher.errorMessage}
              />
            </>
          )}
        </TopGradientBox>
      )}
    </div>
  );
}

export async function loader(args: LoaderFunctionArgs) {
  return {
    IMAGES_SERVER_URL: args.context.cloudflare.env.IMAGES_SERVER_URL,
  };
}
