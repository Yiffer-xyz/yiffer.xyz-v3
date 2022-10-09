import { ActionFunction, json, LoaderFunction } from '@remix-run/cloudflare';
import { useActionData, useLoaderData, useSubmit, useTransition } from '@remix-run/react';
import { useEffect, useState } from 'react';
import LoadingButton from '~/components/Buttons/LoadingButton';
import InfoBox from '~/components/InfoBox';
import { Artist, UserSession } from '~/types/types';
import { authLoader, mergeLoaders } from '~/utils/loaders';
import BackToContribute from '../BackToContribute';
import Step1 from './step1';
import Step2ComicData from './step2-comicdata';
import Step3Pagemanager from './step3-pagemanager';
import Step4Thumbnail from './step4-thumbnail';
import Step5Tags from './step5-tags';
import SuccessMessage from './success';
const illegalComicNameChars = ['#', '/', '?', '\\'];
const maxUploadBodySize = 80 * 1024 * 1024; // 80 MB

const componentLoader: LoaderFunction = async ({ context }) => {
  const artistsPromise = getArtists(context.URL_BASE_V2);
  const comicsPromise = getComics(context.URL_BASE);

  const [artists, comics] = await Promise.all([artistsPromise, comicsPromise]);
  return {
    artists,
    comics,
    uploadUrlBase: context.URL_BASE_V2,
  };
};

export const loader = mergeLoaders(componentLoader, authLoader);

export const action: ActionFunction = async ({ request, context }) => {
  const formData = await request.formData();
  const body = JSON.parse(formData.get('body') as string) as UploadBody;
  const { error } = validateUploadForm(body);
  if (error) {
    return json({ error }, { status: 400 });
  }

  const response = await fetch(`${context.URL_BASE_V2}/new-api/upload`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    return json({ error: await response.text() }, { status: response.status });
  }

  return json({ success: true });
};

interface ComponentLoaderData {
  artists: Artist[];
  comics: AnyKindOfComic[];
  uploadUrlBase: string;
  user: UserSession | null;
}

interface ApiResponse {
  error?: string;
  success?: boolean;
}

export default function Upload() {
  const submitThing = useSubmit();
  const actionData = useActionData();
  const transition = useTransition();

  const { artists, comics, uploadUrlBase, user }: ComponentLoaderData = useLoaderData();
  const [step, setStep] = useState<number | string>(2);
  const [comicData, setComicData] = useState<NewComicData>(createEmptyUploadData());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentResponse, setCurrentResponse] = useState<ApiResponse>({});

  // This is silly, but I see no way to clear the actionData after one submit.
  // This is needed because otherwise, if 1st submit errors, upon the next submit,
  // the error in the actionData will still be there.
  useEffect(() => {
    // If we already have a response and now started submitting, clear the response
    if (transition.state === 'submitting') {
      setCurrentResponse({});
      return;
    }

    // Otherwise, react to the actionData (response)
    setIsSubmitting(false);
    setCurrentResponse(actionData);
    if (actionData?.success) {
      setStep('success');
    } else if (actionData?.error) {
      setError(actionData.error);
    }
  }, [actionData, transition.state]);

  async function submit() {
    const randomId = generateRandomId();
    const uploadId = `${comicData.comicName}-${randomId}`;
    setError(null);

    let newArtist: NewArtist | undefined;
    if (comicData.newArtist.artistName) {
      newArtist = {
        ...comicData.newArtist,
        links: comicData.newArtist.links.filter(link => link.length > 0),
      };
    }

    const uploadBody: UploadBody = {
      uploadId,
      comicName: comicData.comicName,
      category: comicData.category,
      classification: comicData.classification,
      state: comicData.state,
      tagIds: comicData.tagIds,
      newArtist: newArtist,
      artistId: comicData.artistId,
      numberOfPages: comicData.files.length - 1,
      previousComic: comicData.previousComic?.comicId ? comicData.previousComic : undefined,
      nextComic: comicData.nextComic?.comicId ? comicData.nextComic : undefined,
    };

    const formData = new FormData();
    formData.append('body', JSON.stringify(uploadBody));

    // TODO: only temporary to make stuff work, until we implement thumbnail thing
    comicData.thumbnailFile = comicData.files[0];

    const { error } = validateUploadForm(uploadBody);
    if (error) {
      setError(error);
      return;
    }
    if (comicData.files.length < 3 || !comicData.thumbnailFile) {
      setError('You need at least 3 pages and a thumbnail');
      return;
    }

    setIsSubmitting(true);
    // First, upload files, split. Do this directly to the old api,
    // because CF workers might have stricter limits than the old api
    // and there is no need to go through that for this - old API
    // deals with all validation and handling regardless.
    const { error: uploadError } = await uploadFiles(comicData, uploadId, uploadUrlBase);
    if (uploadError) {
      setError(uploadError);
      setIsSubmitting(false);
      return;
    }

    // Then, submit the rest of the data
    submitThing(formData, { encType: 'multipart/form-data', method: 'post' });
  }

  return (
    <div className="container mx-auto pb-16">
      <h1>Upload a comic</h1>
      <p className="mb-4">
        <BackToContribute />
      </p>

      {step === 'success' && <SuccessMessage isLoggedIn={!!user} />}

      {step === 1 && <Step1 onNext={() => setStep(2)} />}

      {step === 2 && (
        <>
          <Step2ComicData
            comicData={comicData}
            onUpdate={setComicData}
            artists={artists}
            comics={comics}
          />

          <Step3Pagemanager comicData={comicData} onUpdate={setComicData} />
          <Step4Thumbnail />
          <Step5Tags />

          <h4 className="mt-8">Finish</h4>

          {error && <InfoBox variant="error" text={error} className="mt-2 mb-4 w-fit" closable />}

          {isSubmitting && (
            <InfoBox variant="info" boldText={false} className="mt-2 mb-4">
              <p>Uploading comic - this could take up to a minute.</p>
              <p className="mt-4">
                Have a cup of coffee while you wait. We'd buy you one as thanks for the help if we
                could!
              </p>
            </InfoBox>
          )}

          <LoadingButton
            text="Submit"
            color="primary"
            variant="contained"
            isLoading={isSubmitting}
            onClick={submit}
          />
        </>
      )}
    </div>
  );
}

async function getArtists(urlBase: string): Promise<Artist[]> {
  const artistsResponse = await fetch(`${urlBase}/new-api/artists?includePending=true`);
  const allArtists: Artist[] = await artistsResponse.json();
  return allArtists.map(a => ({ ...a, name: a.name.replace('"', '') }));
}

async function getComics(urlBase: string): Promise<AnyKindOfComic[]> {
  const response = await fetch(`${urlBase}/api/all-comics-simple`);
  const comics: AnyKindOfComic[] = await response.json();
  return comics;
}

function pageNumberToPageName(pageNum: number, filename: string): string {
  const pageNumberString: string =
    pageNum < 100 ? (pageNum < 10 ? '00' + pageNum : '0' + pageNum) : pageNum.toString();
  return `${pageNumberString}.${getFileExtension(filename)}`;
}

function getFileExtension(filename: string) {
  return filename.substring(filename.lastIndexOf('.') + 1);
}

function validateUploadForm(uploadBody: UploadBody): { error?: string } {
  if (!uploadBody.comicName) {
    return { error: 'Comic name is required' };
  }
  if (uploadBody.comicName.length < 2) {
    return { error: 'Comic name must be at least 2 characters' };
  }
  if (illegalComicNameChars.some(char => uploadBody.comicName.includes(char))) {
    return { error: 'Comic name contains illegal characters' };
  }
  if (!uploadBody.category) {
    return { error: 'Category is required' };
  }
  if (!uploadBody.classification) {
    return { error: 'Classification is required' };
  }
  if (!uploadBody.state) {
    return { error: 'State is required' };
  }
  if (!uploadBody.artistId && !uploadBody.newArtist) {
    return { error: 'Artist is required' };
  }
  return {};
}

async function uploadFiles(
  comicData: NewComicData,
  uploadId: string,
  uploadUrlBase: string
): Promise<{ error?: string }> {
  const thumbnailFile = comicData.thumbnailFile as File;

  const filesFormDatas = Array<FormData>();
  let currentFormData = new FormData();
  currentFormData.append(
    'files',
    thumbnailFile,
    `thumbnail.${getFileExtension(thumbnailFile.name)}`
  );
  currentFormData.append('comicName', comicData.comicName);
  currentFormData.append('uploadId', uploadId);
  let currentFormDataSize = 0;

  for (let i = 0; i < comicData.files.length; i++) {
    const file = comicData.files[i];
    // Split the request into multiple FormDatas/submissions if size is too big.
    if (currentFormDataSize + file.size > maxUploadBodySize) {
      filesFormDatas.push(currentFormData);
      currentFormData = new FormData();
      currentFormData.append('comicName', comicData.comicName);
      currentFormDataSize = 0;
    }

    currentFormData.append(`files`, file, pageNumberToPageName(i + 1, file.name));
    currentFormDataSize += file.size;
  }
  filesFormDatas.push(currentFormData);

  const uploadPromises = filesFormDatas.map(uploadFormData =>
    fetch(`${uploadUrlBase}/new-api/upload-pages`, {
      method: 'POST',
      body: uploadFormData,
    })
  );
  const responses = await Promise.all(uploadPromises);

  for (const response of responses) {
    if (!response.ok) {
      return { error: response.statusText };
    }
  }

  return {};
}

function generateRandomId() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function createEmptyUploadData(): NewComicData {
  return {
    comicName: '',
    category: '',
    classification: '',
    state: '',
    tagIds: [],
    newArtist: {
      artistName: '',
      e621Name: '',
      patreonName: '',
      links: [''],
    },
    // Validation that must be computed from within components, rather than on submit
    validation: {
      isLegalComicName: false,
      isLegalNewArtist: undefined,
    },
    files: [],
  };
}

export interface NewArtist {
  artistName: string;
  e621Name: string;
  patreonName: string;
  links: string[];
}

// Can be either a live comic, a pending comic, or one uploaded but awaiting processing
export interface AnyKindOfComic {
  comicId: number;
  comicName: string;
  isPending: boolean;
  isUpload: boolean;
}

// The submitted payload
export interface UploadBody {
  uploadId: string;
  comicName: string;
  artistId?: number;
  newArtist?: NewArtist;
  category: string;
  classification: string;
  state: string;
  previousComic?: AnyKindOfComic;
  nextComic?: AnyKindOfComic;
  tagIds: number[];
  numberOfPages: number;
}

// For handling upload data internally in the front-end
export interface NewComicData {
  comicName: string;
  artistId?: number;
  uploadArtistId?: number;
  newArtist: NewArtist;
  category: string;
  classification: string;
  state: string;
  previousComic?: AnyKindOfComic;
  nextComic?: AnyKindOfComic;
  tagIds: number[];
  validation: {
    isLegalComicName: boolean;
    isLegalNewArtist?: boolean;
  };
  files: File[];
  thumbnailFile?: File;
}
