import type { ActionFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import {
  Form,
  useActionData,
  useFetcher,
  useLoaderData,
  useTransition,
} from '@remix-run/react';
import { useEffect, useRef, useState } from 'react';
import { clearTimeout } from 'timers';
import LoadingButton from '~/components/Buttons/LoadingButton';
import Checkbox from '~/components/Checkbox/Checkbox';
import InfoBox from '~/components/InfoBox';
import Textarea from '~/components/Textarea/Textarea';
import TextInput from '~/components/TextInput/TextInput';
import TopGradientBox from '~/components/TopGradientBox';
import { SimilarComicResponse } from '~/routes/api/search-similarly-named-comic';
import type { UserSession } from '~/types/types';
import { authLoader, mergeLoaders } from '~/utils/loaders';
import BackToContribute from '../BackToContribute';

export const loader = mergeLoaders(authLoader);

export const action: ActionFunction = async function ({ request, context }) {
  const reqBody = await request.formData();
  const { comicName, artist, linksComments } = Object.fromEntries(reqBody);
  const fields = { comicName, artist, comment: linksComments };

  const response = await fetch(`${context.URL_BASE}/api/comicsuggestions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: request.headers.get('cookie') || '',
    },
    body: JSON.stringify(fields),
  });

  if (!response.ok) {
    return json({ error: await response.text(), fields }, { status: response.status });
  } else {
    return json({ success: true });
  }
};

export default function Upload() {
  const actionData = useActionData();
  const similarComicsFetcher = useFetcher();
  const similarArtistsFetcher = useFetcher();
  const [comicName, setComicName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [comments, setComments] = useState('');
  const [similarComicNames, setSimilarComicNames] = useState<string[]>([]);
  const [differentComic, setDifferentComic] = useState(false);
  const [bannedArtistNames, setBannedArtistNames] = useState<string[]>([]);
  const [differentArtist, setDifferentArtist] = useState(false);
  const { user }: { user: UserSession | null } = useLoaderData();
  const debounceTimeoutArtistRef = useRef<NodeJS.Timeout | null>(null);
  const debounceTimeoutComicRef = useRef<NodeJS.Timeout | null>(null);
  const transition = useTransition();

  useEffect(onComicNameChange, [comicName]);

  function onComicNameChange() {
    setSimilarComicNames([]);
    if (debounceTimeoutComicRef.current) clearTimeout(debounceTimeoutComicRef.current);
    if (comicName.length < 3) return;

    debounceTimeoutComicRef.current = setTimeout(() => {
      similarComicsFetcher.submit(
        { comicName },
        { method: 'post', action: '/api/search-similarly-named-comic' }
      );
    }, 1500);
  }

  useEffect(() => {
    const similarComics = similarComicsFetcher.data as SimilarComicResponse;
    if (similarComics) {
      const names: string[] = [];
      if (similarComics.exactMatchComic) {
        names.push(similarComics.exactMatchComic);
      }
      if (similarComics.exactMatchRejectedComic) {
        names.push(similarComics.exactMatchRejectedComic);
      }
      names.push(...similarComics.similarComics, ...similarComics.similarRejectedComics);

      setSimilarComicNames(names);
    }
  }, [similarComicsFetcher.data]);

  useEffect(onArtistNameChange, [artistName]);

  function onArtistNameChange() {
    setBannedArtistNames([]);
    if (debounceTimeoutArtistRef.current) clearTimeout(debounceTimeoutArtistRef.current);
    if (artistName.length < 3) return;

    debounceTimeoutArtistRef.current = setTimeout(() => {
      similarArtistsFetcher.submit(
        { artistName },
        { method: 'post', action: '/api/search-banned-artists' }
      );
    }, 1500);
  }

  useEffect(() => {
    if (similarArtistsFetcher.data) {
      setBannedArtistNames(similarArtistsFetcher.data);
    }
  }, [similarArtistsFetcher.data]);

  const getSuccessText = function () {
    if (user) {
      return 'You can track its progress and result in the "Your contributions" section of the previous page.';
    }

    return (
      'Since you are not logged in, you cannot track the status and result of your submission. We' +
      ' recommend that you create a user next time - it will take you under a minute!'
    );
  };

  const getArtistText = function () {
    let name = '';

    bannedArtistNames.forEach((artist: string, idx) => {
      name += artist;
      if (idx !== bannedArtistNames.length) name += ', ';
    });

    return name;
  };

  const isSubmitDisabled = function (): boolean {
    return (!comicName ||
      !artistName ||
      !comments ||
      (similarComicNames.length > 0 && !differentComic) ||
      (bannedArtistNames.length > 0 && !differentArtist)) as boolean;
  };

  return (
    <section className="container mx-auto justify-items-center">
      <h1 className="mb-2">Suggest a comic</h1>
      <p className="mb-4">
        <BackToContribute />
      </p>

      {actionData?.success ? (
        <InfoBox
          title="Thanks for helping out!"
          text={getSuccessText()}
          variant="success"
          className="mt-4"
        />
      ) : (
        <>
          <h4>Introduction</h4>
          <p>
            If you would like to follow your suggestion&apos;s status,{' '}
            <span>create an account!</span> You can then follow updates in the &quot;view
            your contributions&quot; section above. Having a user will also earn you
            points in the scoreboard on the previous page - though significantly less than
            if you upload the comic yourself.
          </p>
          <br />
          <h4>Guidelines</h4>
          <ul className="list-none ml-4 spaced">
            <li>
              The comic should be at least 4 pages long. If the pages have lots of panels
              or if the comic is of very high quality, 3-page comics might be accepted.
            </li>
            <li>
              The comic will not be accepted if it is of low quality (poorly drawn).
            </li>
            <li>The comic will not be accepted if it is not in English.</li>
            <li>The comic might not be accepted if it is uncolored.</li>
            <li>The comic will not be accepted if it has censoring bars, dots, etc.</li>
            <li>
              We do not accept cub comics, nor ones by artists Jay Naylor and Voregence
              who have asked not to be represented here.
            </li>
          </ul>
          <TopGradientBox containerClassName="my-10 mx-20 shadow-lg">
            <Form method="post" className="w-fit mx-8 py-6">
              <h3 className="pb-6">Suggest comic</h3>
              <TextInput
                label="Comic name (required)"
                name="comicName"
                className="mb-4"
                onChange={setComicName}
                value={comicName}
              />

              {similarComicNames.length > 0 && (
                <>
                  <p>
                    The following comics with similar names already exists in our system.
                    If the comic you are suggesting is the same as one of these, please do
                    not suggest it. If the comics are not available to you currently on
                    Yiffer.xyz, they are most likely in a pending state from someone
                    else&apos;s submission or have been removed.
                  </p>
                  <ul className="list-none ml-4 spaced mb-4 mt-2">
                    {similarComicNames.map((result, index) => (
                      <li key={`result${index}`}>{result.toString()}</li>
                    ))}
                  </ul>
                  <Checkbox
                    label="The suggested comic is not one of the above"
                    checked={differentComic}
                    onChange={setDifferentComic}
                  />
                </>
              )}

              <TextInput
                label="Artist (if known)"
                name="artist"
                className="mt-12 mb-4"
                onChange={setArtistName}
                value={artistName}
              />

              {bannedArtistNames.length > 0 && (
                <>
                  <p className="mb-4">
                    An artist with the name {getArtistText()} has requested we do not host
                    their comics.{' '}
                  </p>
                  <Checkbox
                    label="This is a different artist."
                    checked={differentArtist}
                    onChange={setDifferentArtist}
                  />
                </>
              )}

              <Textarea
                label="Links, comments (required)"
                name="linksComments"
                className="pb-12 mt-12"
                value={comments}
                onChange={setComments}
              />

              {actionData?.error && (
                <InfoBox variant="error" text={actionData.error} className="my-2" />
              )}

              <p>
                Please provide some link (e.g. e621, FurAffinity, u18chan, reddit,
                anything not behind a paywall), and any other helpful comments you may
                have. If you have multiple sources, feel free to provide all of them!
              </p>
              <div className="flex justify-center mt-6">
                <LoadingButton
                  isLoading={transition.state === 'submitting'}
                  text="Submit suggestion"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitDisabled()}
                />
              </div>
            </Form>
          </TopGradientBox>
        </>
      )}
    </section>
  );
}
