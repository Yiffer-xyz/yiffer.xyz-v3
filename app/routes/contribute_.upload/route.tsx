import '~/utils/cropper.min.css';
import { useLoaderData } from '@remix-run/react';
import { useEffect, useState } from 'react';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import InfoBox from '~/ui-components/InfoBox';
import { getAllArtistsQuery, mapArtistTiny } from '~/route-funcs/get-artists';
import type { DbComicTiny } from '~/route-funcs/get-comics';
import { getAllComicNamesAndIDsQuery, mapDBComicTiny } from '~/route-funcs/get-comics';
import { getAllTagsQuery } from '~/route-funcs/get-tags';
import { isModOrAdmin, type ArtistTiny, type ComicTiny, type Tag } from '~/types/types';
import { authLoader } from '~/utils/loaders';
import Step1 from './step1';
import Step3Pagemanager from './step3-pagemanager';
import Step4Thumbnail from './step4-thumbnail';
import SuccessMessage from './success';
import { processUpload } from './upload-handler.server';
import {
  create400Json,
  create500Json,
  createSuccessJson,
  logApiError,
  makeDbErr,
  processApiError,
} from '~/utils/request-helpers';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import type { ComicImage } from '~/utils/general';
import {
  generateRandomId,
  getFileExtension,
  isUsernameUrl,
  pageNumberToPageName,
} from '~/utils/general';
import ComicDataEditor from '~/page-components/ComicManager/ComicData';
import TagsEditor from '~/page-components/ComicManager/Tags';
import type { QueryWithParams } from '~/utils/database-facade';
import { queryDbMultiple } from '~/utils/database-facade';
import { MAX_UPLOAD_BODY_SIZE } from '~/types/constants';
import Breadcrumbs from '~/ui-components/Breadcrumbs/Breadcrumbs';
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/cloudflare';
import useResizeObserver from '~/utils/useResizeObserver';
export { YifferErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction = () => {
  return [{ title: `Upload | Yiffer.xyz` }];
};

const illegalComicNameChars = ['#', '/', '?', '\\'];

export default function Upload() {
  const { artists, comics, user, tags, IMAGES_SERVER_URL } =
    useLoaderData<typeof loader>();
  const [step, setStep] = useState<number | string>(1);
  const [source, setSource] = useState('');
  const [comicData, setComicData] = useState<NewComicData>(createEmptyUploadData());
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitFetcher = useGoodFetcher({
    method: 'post',
    encType: 'multipart/form-data',
    toastError: false,
    onFinish: () => {
      setIsSubmitting(false);
      if (submitFetcher.success) setStep('success');
      if (submitFetcher.isError) setError(submitFetcher.errorMessage);
    },
    onError: () => {
      setIsSubmitting(false);
      setError('Error submitting upload');
    },
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  async function uploadFiles(
    comicData: NewComicData,
    uploadId: string
  ): Promise<{ error?: string }> {
    const thumbnailFile = comicData.thumbnail?.file;
    if (!thumbnailFile) return { error: 'No thumbnail file' };

    const filesFormDatas = Array<FormData>();
    let currentFormData = new FormData();
    currentFormData.append(
      'thumbnail',
      thumbnailFile,
      `thumbnail.${getFileExtension(thumbnailFile.name)}`
    );
    currentFormData.append('comicName', comicData.name);
    currentFormData.append('uploadId', uploadId);
    let currentFormDataSize = 0;

    for (let i = 0; i < comicData.files.length; i++) {
      const file = comicData.files[i];
      if (!file.file) return { error: `File error for page ${i + 1}` };

      // Split the request into multiple FormDatas/submissions if size is too big.
      if (currentFormDataSize + file.file.size > MAX_UPLOAD_BODY_SIZE) {
        currentFormData.append('hasMore', 'true');
        filesFormDatas.push(currentFormData);
        currentFormData = new FormData();
        currentFormData.append('comicName', comicData.name);
        currentFormData.append('uploadId', uploadId);
        currentFormDataSize = 0;
      }

      currentFormData.append(
        `pages`,
        file.file,
        pageNumberToPageName(i + 1, file.file.name)
      );
      currentFormDataSize += file.file.size;
    }
    filesFormDatas.push(currentFormData);

    for (const formData of filesFormDatas) {
      try {
        const res = await fetch(`${IMAGES_SERVER_URL}/comic-upload`, {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          return { error: 'Error uploading files to server' };
        }
      } catch (e) {
        console.error(e);
        return { error: 'Error uploading files to server' };
      }
    }

    return {};
  }

  async function submit() {
    const randomId = generateRandomId();
    const uploadId = `${comicData.name}-${randomId}`;
    setError(null);

    if (!comicData.validation.isLegalComicName) {
      setError('There is an error regarding the comic name');
      return;
    }

    if (comicData.newArtist.artistName) {
      const isNameIllegal = !comicData.artistId && !comicData.newArtist.isValidName;
      const isE621Illegal =
        !comicData.newArtist.e621Name && !comicData.newArtist.hasConfirmedNoE621Name;
      const isPatreonIllegal =
        !comicData.newArtist.patreonName &&
        !comicData.newArtist.hasConfirmedNoPatreonName;

      if (!comicData.newArtist.areLinksValid) {
        setError('Some of the artist links are invalid');
        return;
      }
      if (isNameIllegal) {
        setError('There is an error regarding the artist name');
        return;
      }
      if (isE621Illegal) {
        setError('You must confirm that the artist does not have an e621 name');
        return;
      }
      if (isPatreonIllegal) {
        setError('You must confirm that the artist does not have a patreon name');
        return;
      }
    }

    let newArtist: NewArtist | undefined;
    if (comicData.newArtist.artistName) {
      newArtist = {
        ...comicData.newArtist,
        links: comicData.newArtist.links.filter(link => link.length > 0),
      };
    }

    const uploadBody: UploadBody = {
      uploadId,
      comicName: comicData.name,
      category: comicData.category,
      state: comicData.state,
      tagIds: comicData.tags.map(tag => tag.id),
      newArtist: newArtist,
      artistId: comicData.artistId,
      numberOfPages: comicData.files.length,
      previousComic: comicData.previousComic?.id ? comicData.previousComic : undefined,
      nextComic: comicData.nextComic?.id ? comicData.nextComic : undefined,
      source,
    };

    const formData = new FormData();
    formData.append('body', JSON.stringify(uploadBody));

    const { error } = validateUploadForm(uploadBody);
    if (error) {
      setError(error);
      return;
    }
    if (comicData.files.length < 3 || !comicData.thumbnail) {
      setError('You need at least 3 pages and a thumbnail');
      return;
    }

    setIsSubmitting(true);
    // First, upload files, split. Do this directly to the old api,
    // because CF workers might have stricter limits than the old api
    // and there is no need to go through that for this - old API
    // deals with all validation and handling regardless.
    const { error: uploadError } = await uploadFiles(comicData, uploadId);

    if (uploadError) {
      setError(uploadError);
      setIsSubmitting(false);
      return;
    }

    submitFetcher.submit(formData);
  }

  // function fillWithStuff() {
  //   setComicData({
  //     ...comicData,
  //     name: 'Test2 ' + randomString(12),
  //     category: 'MF',
  //     state: 'finished',
  //     validation: {
  //       isLegalComicName: true,
  //     },
  //     tags: Array.from(
  //       new Set([
  //         tags[Math.floor(Math.random() * tags.length)],
  //         tags[Math.floor(Math.random() * tags.length)],
  //         tags[Math.floor(Math.random() * tags.length)],
  //         tags[Math.floor(Math.random() * tags.length)],
  //         tags[Math.floor(Math.random() * tags.length)],
  //         tags[Math.floor(Math.random() * tags.length)],
  //         tags[Math.floor(Math.random() * tags.length)],
  //       ])
  //     ),
  //     previousComic: comics[Math.floor(Math.random() * comics.length)],
  //     nextComic: comics[Math.floor(Math.random() * comics.length)],
  //     artistId: artists[Math.floor(Math.random() * artists.length)].id,
  //   });
  // }

  const [divRef, { width }] = useResizeObserver<HTMLDivElement>();

  return (
    <div ref={divRef} className="container mx-auto pb-16">
      <h1>Upload a comic</h1>

      <Breadcrumbs
        prevRoutes={[{ text: 'Contribute', href: '/contribute' }]}
        currentRoute="Upload"
      />

      {/* <Button color="error" text="FILL WITH STUFF" onClick={fillWithStuff} /> */}

      {user?.userType === 'moderator' && (
        <InfoBox variant="info" showIcon className="mb-4">
          You're logged in as a mod. Your comic (and artist, if it's a new one) will
          therefore skip the regular user upload queue and go straight to 'pending'.
        </InfoBox>
      )}

      {step === 'success' && (
        <SuccessMessage isLoggedIn={!!user} isModOrAdmin={!!user && isModOrAdmin(user)} />
      )}

      {step === 1 && (
        <Step1
          isMod={(user && isModOrAdmin(user)) ?? false}
          onNext={(source: string) => {
            setSource(source);
            setStep(2);
          }}
        />
      )}

      {step === 2 && (
        <>
          <ComicDataEditor
            comicData={comicData}
            onUpdate={setComicData}
            artists={artists}
            comics={comics}
          />

          <Step3Pagemanager
            comicData={comicData}
            onUpdate={setComicData}
            contentWidth={width}
          />

          <Step4Thumbnail comicData={comicData} onUpdate={setComicData} />

          <h4 className="mt-8">Tags</h4>
          <TagsEditor
            allTags={tags}
            tags={comicData.tags}
            onUpdate={tags => setComicData({ ...comicData, tags })}
            includeClearAll
            className="mt-1"
            title=""
          />

          <h4 className="mt-8">Finish</h4>

          {error && <InfoBox variant="error" text={error} className="mt-2 mb-4 w-fit" />}

          {isSubmitting && (
            <InfoBox variant="info" boldText={false} className="mt-2 mb-4">
              <p>Uploading comic - this could take a little while, please be patient!</p>
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

export async function loader(args: LoaderFunctionArgs) {
  const db = args.context.cloudflare.env.DB;

  const dbStatements: QueryWithParams[] = [
    getAllArtistsQuery({ includePending: true, modifyNameIncludeType: true }),
    getAllComicNamesAndIDsQuery({ modifyNameIncludeType: true }),
    getAllTagsQuery(),
  ];

  const [dbRes, user] = await Promise.all([
    queryDbMultiple<[ArtistTiny[], DbComicTiny[], Tag[]]>(db, dbStatements),
    authLoader(args),
  ]);

  if (dbRes.isError) {
    return processApiError(
      'Error loading contribute>upload',
      makeDbErr(dbRes, 'Error getting artist+dbComic+tags')
    );
  }

  const [allDbArtists, allDbComics, tags] = dbRes.result;
  const artists = mapArtistTiny(allDbArtists, true);
  const comics = mapDBComicTiny(allDbComics, true);

  return {
    artists,
    comics,
    tags,
    user,
    IMAGES_SERVER_URL: args.context.cloudflare.env.IMAGES_SERVER_URL,
  };
}

export async function action(args: ActionFunctionArgs) {
  const user = await authLoader(args);
  const formData = await args.request.formData();
  const body = JSON.parse(formData.get('body') as string) as UploadBody;
  const { error } = validateUploadForm(body);
  if (error) return create400Json(error);

  const err = await processUpload(
    args.context.cloudflare.env.DB,
    body,
    user,
    args.request.headers.get('CF-Connecting-IP') || 'unknown'
  );
  if (err) {
    logApiError('Error in upload comic submit', err, body);
    return create500Json();
  }

  return createSuccessJson();
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
  if (!uploadBody.state) {
    return { error: 'State is required' };
  }
  if (!uploadBody.artistId && !uploadBody.newArtist) {
    return { error: 'Artist is required' };
  }
  if (uploadBody.newArtist) {
    if (uploadBody.newArtist.e621Name && isUsernameUrl(uploadBody.newArtist.e621Name)) {
      return { error: 'e621 name must be a username, not a URL' };
    }
    if (
      uploadBody.newArtist.patreonName &&
      isUsernameUrl(uploadBody.newArtist.patreonName)
    ) {
      return { error: 'Patreon name must be a username, not a URL' };
    }
  }
  return {};
}

function createEmptyUploadData(): NewComicData {
  return {
    name: '',
    category: '',
    state: '',
    tags: [],
    newArtist: {
      artistName: '',
      e621Name: '',
      patreonName: '',
      links: [''],
      isValidName: false,
      areLinksValid: true,
    },
    // Validation that must be computed from within components, rather than on submit
    validation: {
      isLegalComicName: false,
    },
    files: [],
  };
}

export type NewArtist = {
  id?: number;
  artistName: string;
  e621Name: string;
  patreonName: string;
  links: string[];
  isValidName?: boolean;
  hasConfirmedNoE621Name?: boolean;
  hasConfirmedNoPatreonName?: boolean;
  areLinksValid?: boolean;
};

// The submitted payload
export type UploadBody = {
  uploadId: string;
  comicName: string;
  artistId?: number;
  newArtist?: NewArtist;
  category: string;
  state: string;
  previousComic?: ComicTiny;
  nextComic?: ComicTiny;
  tagIds: number[];
  numberOfPages: number;
  source: string;
};

// For handling upload data internally in the front-end
export type NewComicData = {
  id?: number;
  name: string;
  artistId?: number;
  newArtist: NewArtist;
  category: string;
  state: string;
  previousComic?: ComicTiny;
  nextComic?: ComicTiny;
  tags: Tag[];
  validation: {
    isLegalComicName: boolean;
  };
  files: ComicImage[];
  thumbnail?: ComicImage;
};
