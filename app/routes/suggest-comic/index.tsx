import { useEffect, useRef, useState } from 'react';
import { MdArrowBack } from 'react-icons/md';
import type { ActionFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { Form, useActionData, useFetcher, useLoaderData } from '@remix-run/react';
import TopGradientBox from '../../components/TopGradientBox';
import Link from '../../components/Link';
import LoadingButton from '../../components/Buttons/LoadingButton';
import InfoBox from '../../components/InfoBox';
import TextInput from '~/components/TextInput/TextInput';
import Textarea from '~/components/Textarea/Textarea';
import Checkbox from '~/components/Checkbox/Checkbox';
import { authLoader, mergeLoaders } from '~/utils/loaders';
import type { Artist, Comic, UserSession } from '~/types/types';
import { clearTimeout } from 'timers';

export const loader = mergeLoaders(authLoader);

export const action: ActionFunction = async function ({ request }) {
  const reqBody = await request.formData();
  const { comicName, artist, linksComments } = Object.fromEntries(reqBody);
  const fields = { comicName, artist, comment: linksComments };

  const response = await fetch('https://yiffer.xyz/api/comicsuggestions', {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data',
      cookie: request.headers.get('cookie') || '',
    },
    body: reqBody,
  });

  if (!response.ok) {
    return json({ error: await response.text(), fields }, { status: response.status });
  } else {
    return json({ success: true });
  }
};

export default function Upload() {
  const actionData = useActionData();
  const fetcher = useFetcher();
  const [comicName, setComicName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [comments, setComments] = useState('');
  const [similarResults, setSimilarResults] = useState<Array<Comic | string>>([]);
  const [notSuggested, setNotSuggested] = useState(false);
  const [artistBanned, setArtistBanned] = useState<Array<Artist | string>>([]);
  const [differentArtist, setDifferentArtist] = useState(false);
  const { user }: { user: UserSession | null } = useLoaderData();
  const debounceTimeoutArtistRef = useRef<NodeJS.Timeout | null>(null);
  const debounceTimeoutComicRef = useRef<NodeJS.Timeout | null>(null);

  const onComicNameChange = function () {
    setSimilarResults([]);

    if (debounceTimeoutComicRef.current) clearTimeout(debounceTimeoutComicRef.current);

    if (comicName.length < 3) return;

    debounceTimeoutComicRef.current = setTimeout(() => {
      fetcher.submit({ comicName }, { method: 'post', action: '/action/search-suggested-comics' });
    }, 1500);
  };

  useEffect(onComicNameChange, [comicName]);

  const onArtistNameChange = function () {
    setArtistBanned([]);

    if (debounceTimeoutArtistRef.current) clearTimeout(debounceTimeoutArtistRef.current);

    if (artistName.length < 3) return;

    debounceTimeoutArtistRef.current = setTimeout(() => {
      fetcher.submit({ artistName }, { method: 'post', action: '/action/search-banned-artists' });
    }, 1500);
  };

  useEffect(onArtistNameChange, [artistName]);

  useEffect(() => {
    if (fetcher.data) {
      const { bannedArtists, suggestedComics } = fetcher.data;

      if (bannedArtists) {
        setArtistBanned(bannedArtists);
      } else if (similarResults) {
        setSimilarResults(suggestedComics);
      }
    }
  }, [fetcher.data]);

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

    artistBanned.forEach((artist: Artist | string, idx) => {
      if (artist instanceof String) {
        name += artist;
      } else {
        // @ts-ignore
        name += artist.name;
      }

      if (idx !== artistBanned.length) name += ', ';
    });

    return name;
  };

  const isSubmitDisabled = function (): boolean {
    return (!comicName ||
      !artistName ||
      !comments ||
      (similarResults.length > 0 && !notSuggested) ||
      (artistBanned.length > 0 && !differentArtist)) as boolean;
  };

  return (
    <section className="container mx-auto justify-items-center">
      <h1 className="text-center mb-2">Suggest a comic</h1>
      <p className="text-center">
        <Link href="/" text="Back" Icon={MdArrowBack} />
      </p>
      <p className="mb-4 text-center">
        <Link href="https://yiffer.xyz/" text="To front page" />
      </p>

      {fetcher?.data?.success ? (
        <InfoBox
          title="Thanks for helping out!"
          boldText={false}
          text={getSuccessText()}
          variant="success"
          className="my-2 mx-32 mt-8"
        />
      ) : (
        <>
          <h4>Introduction</h4>
          <p>
            If you would like to follow your suggestion&apos;s status,{' '}
            <span>create an account!</span> You can then follow updates in the &quot;view your
            contributions&quot; section above. Having a user will also earn you points in the
            scoreboard on the previous page - though significantly less than if you upload the comic
            yourself.
          </p>
          <br />
          <h4>Guidelines</h4>
          <ul className="list-none ml-4 spaced">
            <li>
              The comic should be at least 4 pages long. If the pages have lots of panels or if the
              comic is of very high quality, 3-page comics might be accepted.
            </li>
            <li>The comic will not be accepted if it is of low quality (poorly drawn).</li>
            <li>The comic will not be accepted if it is not in English.</li>
            <li>The comic might not be accepted if it is uncolored.</li>
            <li>The comic will not be accepted if it has censoring bars, dots, etc.</li>
            <li>
              We do not accept cub comics, nor ones by artists Jay Naylor and Voregence who have
              asked not to be represented here.
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

              {similarResults.length > 0 && (
                <>
                  <p>
                    The following comics with similar names already exists in our system. If the
                    comic you are suggesting is the same as one of these, please do not suggest it.
                    If the comics are not available on Yiffer.xyz, they are most likely in a pending
                    state from someone else&apos;s submission.
                  </p>
                  <ul className="list-none ml-4 spaced mb-4 mt-2">
                    {similarResults.map((result, index) => (
                      <li key={`result${index}`}>{result}</li>
                    ))}
                  </ul>
                  <Checkbox
                    label="The suggested comic is not one of the above"
                    checked={notSuggested}
                    onChange={setNotSuggested}
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

              {artistBanned.length > 0 && (
                <>
                  <p className="mb-4">
                    An artist with the name {getArtistText()} has requested we do not host their
                    comics.{' '}
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
                Please provide some link (e.g. e621, FurAffinity, u18chan, reddit, anything not
                behind a paywall), and any other helpful comments you may have. If you have multiple
                sources, feel free to provide all of them!
              </p>
              <div className="flex justify-center mt-6">
                <LoadingButton
                  isLoading={false}
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
