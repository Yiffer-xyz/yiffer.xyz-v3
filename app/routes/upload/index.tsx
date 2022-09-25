import Link from '../../components/Link';
import { MdArrowBack } from 'react-icons/md';
import Step1 from './step1';
import Step2ComicData from './step2-comicdata';
import { LoaderFunction } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { useState } from 'react';
import Step3Pagemanager from './step3-pagemanager';
import Step4Thumbnail from './step4-thumbnail';
import Step5Tags from './step5-tags';
import LoadingButton from '~/components/Buttons/LoadingButton';

async function getArtists(urlBase: string): Promise<AnyKindOfArtist[]> {
  const pendingPromise = fetch(`${urlBase}/api/uploaded-pending-artists`);
  const allPromise = fetch(`${urlBase}/api/artists`);
  const [pendingResponse, allResponse] = await Promise.all([pendingPromise, allPromise]);
  const pendingArtists: AnyKindOfArtist[] = await pendingResponse.json();
  const allArtists: AnyKindOfArtist[] = await allResponse.json();

  return [
    ...allArtists.map(a => ({ name: a.name, id: a.id, isUploaded: false })),
    ...pendingArtists.map(a => ({ name: a.name, id: a.id, isUploaded: true })),
  ];
}

async function getComics(urlBase: string): Promise<AnyKindOfComic[]> {
  const response = await fetch(`${urlBase}/api/all-comics-simple`);
  const comics = await response.json();
  return comics as AnyKindOfComic[];
}

export const loader: LoaderFunction = async function ({ context }) {
  const artistsPromise = getArtists(context.URL_BASE);
  const comicsPromise = getComics(context.URL_BASE);

  const [artists, comics] = await Promise.all([artistsPromise, comicsPromise]);
  return { artists, comics };
};

// Can be a live artist, or one that's been uploaded by a user but is still pending
export interface AnyKindOfArtist {
  id: number;
  name: string;
  isUploaded: boolean;
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
}

export default function Upload() {
  const { artists, comics }: { artists: AnyKindOfArtist[]; comics: AnyKindOfComic[] } =
    useLoaderData();
  const [step, setStep] = useState(1);
  const [comicData, setComicData] = useState<NewComicData>({
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
  });

  return (
    <div className="container mx-auto">
      <h1>Upload a comic</h1>
      <p className="mb-4">
        <Link href="/" text="Back" Icon={MdArrowBack} />
      </p>

      {step === 1 && <Step1 onNext={() => setStep(2)} />}

      {step === 2 && (
        <>
          <Step2ComicData
            comicData={comicData}
            onUpdate={setComicData}
            artists={artists}
            comics={comics}
          />

          <Step3Pagemanager />
          <Step4Thumbnail />
          <Step5Tags />

          <h4 className="mt-8">Finish</h4>

          <LoadingButton
            text="Submit"
            color="primary"
            variant="contained"
            isLoading={false}
            onClick={() => {}}
          />
        </>
      )}
    </div>
  );
}
