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
import pendingComics from '~/mock-data/pendingcomics';

async function getArtists(urlBase: string) {
  const response = await fetch(`${urlBase}/api/artists`);
  const artists = await response.json();
  return artists;
}

async function getComics(urlBase: string) {
  console.log(`${urlBase}/api/comics`);
  const response = await fetch(`${urlBase}/api/all-comics`); // TODO: replace with new route
  const comics = await response.json();
  return comics;
}

async function getPendingComics() {
  // TODO: replace with new route
  return pendingComics;
}

export const loader: LoaderFunction = async function ({ context }) {
  const artistsPromise = getArtists(context.URL_BASE);
  const comicsPromise = getComics(context.URL_BASE);
  const pendingComicsPromise = getPendingComics();

  const [artists, comics, pendingComics] = await Promise.all([artistsPromise, comicsPromise, pendingComicsPromise]);

  return { artists, comics, pendingComics, urlBase: context.URL_BASE };
};

export type NewArtist = {
  artistName: string;
  e621Name: string;
  patreonName: string;
  links: string[];
};

export type LiveOrPendingComic = {
  id: number;
  isPending: boolean;
};

export type NewComicData = {
  comicName: string;
  artistId?: number;
  newArtist: NewArtist;
  category: string;
  classification: string;
  state: string;
  previousComic?: LiveOrPendingComic;
  nextComic?: LiveOrPendingComic;
  tagIds: number[];
};

export default function Upload() {
  const { artists, comics, pendingComics, urlBase } = useLoaderData();
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
            pendingComics={pendingComics}
          />

          <Step3Pagemanager />
          <Step4Thumbnail />
          <Step5Tags />

          <h4 className="mt-8">Finish</h4>
          <LoadingButton text="Submit" color="primary" variant="contained" isLoading={false} onClick={() => {}} />
        </>
      )}
    </div>
  );
}
