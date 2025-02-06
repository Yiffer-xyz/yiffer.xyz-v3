import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/cloudflare';
import { Form, useActionData, useLoaderData, useNavigation } from '@remix-run/react';
import { useEffect, useRef, useState } from 'react';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import Checkbox from '~/ui-components/Checkbox/Checkbox';
import InfoBox from '~/ui-components/InfoBox';
import Textarea from '~/ui-components/Textarea/Textarea';
import TextInput from '~/ui-components/TextInput/TextInput';
import TopGradientBox from '~/ui-components/TopGradientBox';
import type { SimilarComicResponse } from '../api.search-similarly-named-comic';
import type { QueryWithParams } from '~/utils/database-facade';
import { queryDbExec, queryDbMultiple } from '~/utils/database-facade';
import type { ResultOrErrorPromise } from '~/utils/request-helpers';
import {
  create400Json,
  createSuccessJson,
  makeDbErrObj,
  processApiError,
} from '~/utils/request-helpers';
import { authLoader } from '~/utils/loaders';
import type { SimilarArtistResponse } from '../api.search-similar-artist';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import Breadcrumbs from '~/ui-components/Breadcrumbs/Breadcrumbs';
import Link from '~/ui-components/Link';
import { MdArrowForward } from 'react-icons/md';
import { isMaliciousString } from '~/utils/string-utils';
export { YifferErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction = () => {
  return [{ title: `Suggest comic | Yiffer.xyz` }];
};

export async function loader(args: LoaderFunctionArgs) {
  return await authLoader(args);
}

export default function Upload() {
  const actionData = useActionData<typeof action>();

  const similarComicsFetcher = useGoodFetcher<SimilarComicResponse>({
    url: '/api/search-similarly-named-comic',
    method: 'post',
  });

  const similarArtistsFetcher = useGoodFetcher({
    url: '/api/search-similar-artist',
    method: 'post',
    onFinish: () => {
      if (!similarArtistsFetcher.data) return;
      setSimilarArtists(similarArtistsFetcher.data);
    },
  });

  const [comicName, setComicName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [comments, setComments] = useState('');

  const [similarComics, setSimilarComics] = useState<SimilarComicResponse>();
  const [isComicnameLegal, setIsComicnameLegal] = useState(true);
  const [hasConfirmedDifferentComic, setHasConfirmedDifferentComic] = useState(false);

  const [similarArtists, setSimilarArtists] = useState<SimilarArtistResponse>();
  const [isArtistNameLegal, setIsArtistNameLegal] = useState(true);
  const [hasConfirmedNewArtist, setHasConfirmedNewArtist] = useState(false);

  const user = useLoaderData<typeof loader>();
  const debounceTimeoutArtistRef = useRef<NodeJS.Timeout | null>(null);
  const debounceTimeoutComicRef = useRef<NodeJS.Timeout | null>(null);
  const transition = useNavigation();

  useEffect(() => {
    let isLegal = false;

    if (similarArtists) {
      const isExactMatch = similarArtists.exactMatchBannedArtist;
      const isSimilar = similarArtists.similarBannedArtists.length > 0;

      if (!isExactMatch && artistName.length > 2) {
        isLegal = !isSimilar || hasConfirmedNewArtist;
      }
    }

    setIsArtistNameLegal(isLegal);
  }, [similarArtists, hasConfirmedNewArtist, artistName.length]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(onComicNameChange, [comicName]);

  function onComicNameChange() {
    setSimilarComics(undefined);
    setIsComicnameLegal(false);
    setHasConfirmedDifferentComic(false);

    if (debounceTimeoutComicRef.current) clearTimeout(debounceTimeoutComicRef.current);
    if (comicName.length < 3) return;

    debounceTimeoutComicRef.current = setTimeout(() => {
      similarComicsFetcher.submit({ comicName });
    }, 1500);
  }

  useEffect(() => {
    if (!similarComicsFetcher.data) return;

    const similarComics = similarComicsFetcher.data;

    const isExactMatch =
      similarComics.exactMatchComic || similarComics.exactMatchRejectedComic;

    const isAnySimilar =
      similarComics.similarComics.length > 0 ||
      similarComics.similarRejectedComics.length > 0;

    let isLegal = false;
    if (!isExactMatch && comicName.length > 2) {
      isLegal = !isAnySimilar || hasConfirmedDifferentComic;
    }

    setSimilarComics(similarComics);
    setIsComicnameLegal(isLegal);
  }, [similarComicsFetcher.data, hasConfirmedDifferentComic, comicName]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(onArtistNameChange, [artistName]);

  function onArtistNameChange() {
    setHasConfirmedNewArtist(false);
    setSimilarArtists(undefined);

    if (debounceTimeoutArtistRef.current) clearTimeout(debounceTimeoutArtistRef.current);
    if (!artistName || artistName.length < 3) return;

    debounceTimeoutArtistRef.current = setTimeout(() => {
      similarArtistsFetcher.submit({ artistName });
    }, 1500);
  }

  const isSubmitDisabled =
    !comicName || !artistName || !comments || !isComicnameLegal || !isArtistNameLegal;

  const isExactComicnameMatch =
    similarComics?.exactMatchComic || similarComics?.exactMatchRejectedComic;
  const isAnySimilarComics =
    similarComics &&
    !isExactComicnameMatch &&
    (similarComics.similarComics.length > 0 ||
      similarComics.similarRejectedComics.length > 0);

  const isExactArtistMatch = similarArtists?.exactMatchBannedArtist;
  const similarOrExactBannedArtist =
    !isExactArtistMatch &&
    similarArtists &&
    similarArtists.similarBannedArtists.length > 0;

  return (
    <section className="container mx-auto pb-8">
      <h1>Suggest a comic</h1>

      <Breadcrumbs
        prevRoutes={[{ text: 'Contribute', href: '/contribute' }]}
        currentRoute="Suggest"
      />

      {actionData?.success ? (
        <InfoBox
          title="Thanks for helping out!"
          variant="success"
          boldText={false}
          className="mt-4"
        >
          {user ? (
            <p>
              You can track your suggestion's progress in the{' '}
              <Link
                isInsideParagraph
                href="/contribute/your-contributions"
                text="Your contributions page"
                className="!text-white"
                IconRight={MdArrowForward}
              />
              .
            </p>
          ) : (
            <p>
              Since you are not logged in, you cannot track the status and result of your
              submission. We recommend that you create an account next time - it will take
              you under a minute!
            </p>
          )}
        </InfoBox>
      ) : (
        <>
          <p>
            If you would like to follow your suggestion&apos;s status,{' '}
            <span>create an account!</span> You can then follow updates in the &quot;view
            your contributions&quot; section on the previous page. Having a user will also
            earn you points in the scoreboard on the previous page - though significantly
            less than if you upload the comic yourself.
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

          <TopGradientBox containerClassName="my-10 shadow-lg">
            <Form method="post" className="w-fit mx-8 py-6">
              <h3 className="pb-6">Suggest comic</h3>
              <TextInput
                label="Comic name (required)"
                name="comicName"
                className="mb-4"
                onChange={setComicName}
                value={comicName}
              />

              {similarComics && (
                <>
                  {isAnySimilarComics && (
                    <>
                      {!hasConfirmedDifferentComic && (
                        <InfoBox
                          variant="warning"
                          boldText={false}
                          className="mt-2"
                          fitWidth
                          disableElevation
                        >
                          {similarComics.similarComics.length > 0 && (
                            <>
                              <p>
                                The following comics with similar names already exist in
                                the system:
                              </p>
                              <ul>
                                {similarComics.similarComics.map((comicName: string) => (
                                  <li key={comicName}>{comicName}</li>
                                ))}
                              </ul>
                            </>
                          )}
                          {similarComics.similarRejectedComics.length > 0 && (
                            <>
                              <p>
                                The following comics with similar names have been
                                rejected. If one of these is your comic, do not upload it:
                              </p>
                              <ul>
                                {similarComics.similarRejectedComics.map(
                                  (comicName: string) => (
                                    <li key={comicName}>{comicName}</li>
                                  )
                                )}
                              </ul>
                            </>
                          )}
                        </InfoBox>
                      )}
                      <Checkbox
                        label="The suggested comic is not one of the above"
                        checked={hasConfirmedDifferentComic}
                        onChange={setHasConfirmedDifferentComic}
                        className="mt-2"
                      />
                    </>
                  )}

                  {similarComics.exactMatchComic && (
                    <InfoBox
                      text={`A comic with this name already exists in the system. You cannot submit this comic name. If you think this is a different comic with the same name, you can add "(<artistname>)" to the end of the comic's name. Please verify that this is not a duplicate before submitting.`}
                      variant="error"
                      className="mt-2"
                      fitWidth
                      disableElevation
                    />
                  )}
                  {similarComics.exactMatchRejectedComic && (
                    <InfoBox
                      text="A comic with this name has been rejected. You cannot submit this comic name."
                      variant="error"
                      className="mt-2"
                      fitWidth
                      disableElevation
                    />
                  )}
                </>
              )}

              <TextInput
                label="Artist"
                name="artist"
                className="mt-12 mb-4"
                onChange={setArtistName}
                value={artistName}
              />

              {isExactArtistMatch && (
                <InfoBox
                  variant="error"
                  className="mt-2"
                  disableElevation
                  text={
                    similarArtists.exactMatchArtist
                      ? 'An artist with this name already exists in the system'
                      : 'An artist with this name has been banned or has requested their comics not be published here'
                  }
                />
              )}

              {similarOrExactBannedArtist && (
                <>
                  {!hasConfirmedNewArtist && (
                    <InfoBox
                      variant="warning"
                      className="mt-2"
                      boldText={false}
                      disableElevation
                    >
                      {similarArtists.similarBannedArtists.length > 0 && (
                        <>
                          <p>
                            The artists are somewhat similar to the one you entered, and
                            have been banned or have requested their comics not be
                            published here:
                          </p>
                          <ul>
                            {similarArtists.similarBannedArtists.map(name => (
                              <li key={name}>{name}</li>
                            ))}
                          </ul>
                        </>
                      )}
                    </InfoBox>
                  )}

                  <Checkbox
                    label="This is not one of the above artists"
                    checked={hasConfirmedNewArtist}
                    onChange={setHasConfirmedNewArtist}
                    className="mt-2"
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
                <InfoBox
                  variant="error"
                  text={actionData.error}
                  className="my-2"
                  disableElevation
                />
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
                  disabled={isSubmitDisabled}
                  isSubmit
                />
              </div>
            </Form>
          </TopGradientBox>
        </>
      )}
    </section>
  );
}

export async function action(args: ActionFunctionArgs) {
  const reqBody = await args.request.formData();
  const logCtx = Object.fromEntries(reqBody);
  const { comicName, artist, linksComments } = logCtx;

  if (!comicName || !artist || !linksComments) {
    return create400Json('Some field is missing');
  }

  if (isMaliciousString(comicName as string, artist as string, linksComments as string)) {
    return create400Json('Malicious input detected');
  }

  const errors = await checkForExistingComicOrSuggestion(
    args.context.cloudflare.env.DB,
    comicName as string
  );
  if (errors?.err) {
    return processApiError('Error in post of /suggest-comic', errors.err, logCtx);
  } else if (errors?.result.comicExists) {
    return create400Json('Comic already exists');
  } else if (errors?.result.suggestionExists) {
    return create400Json('A suggestion for this comic already exists');
  }

  const user = await authLoader(args);
  let userIp = null;
  let userId = null;
  if (user) {
    userId = user.userId;
  } else {
    userIp = args.request.headers.get('CF-Connecting-IP') || 'unknown';
  }

  const insertQuery = `
    INSERT INTO comicsuggestion 
      (Name, ArtistName, Description, UserId, UserIp)
    VALUES (?, ?, ?, ?, ?)`;
  const insertParams = [
    comicName.toString().trim(),
    artist,
    linksComments,
    userId,
    userIp,
  ];

  const dbRes = await queryDbExec(
    args.context.cloudflare.env.DB,
    insertQuery,
    insertParams,
    'Suggest comic'
  );

  if (dbRes.isError) {
    return processApiError(undefined, {
      logMessage: 'Db error in post of /suggest-comic',
      error: dbRes,
      context: logCtx,
    });
  }

  return createSuccessJson();
}

async function checkForExistingComicOrSuggestion(
  db: D1Database,
  comicName: string
): ResultOrErrorPromise<{ comicExists?: boolean; suggestionExists?: boolean }> {
  const dbStatements: QueryWithParams[] = [
    {
      query: `SELECT COUNT(*) AS count FROM comicsuggestion WHERE Name = ?`,
      params: [comicName],
      queryName: 'Comic suggestion check',
    },
    {
      query: 'SELECT COUNT(*) AS count FROM comic WHERE Name = ?',
      params: [comicName],
      queryName: 'Comic suggestion comic check',
    },
  ];

  const dbRes = await queryDbMultiple<[{ count: number }[], { count: number }[]]>(
    db,
    dbStatements
  );

  if (dbRes.isError) {
    return makeDbErrObj(
      dbRes,
      'Error checking for existing comic+suggestion in checkForExistingComicOrSuggestion',
      { comicName }
    );
  }

  const [suggestionsCount, existingComicsCount] = dbRes.result;

  if (suggestionsCount.length && suggestionsCount[0].count > 0) {
    return { result: { suggestionExists: true } };
  }

  if (existingComicsCount.length && existingComicsCount[0].count > 0) {
    return { result: { comicExists: true } };
  }

  return { result: { comicExists: false, suggestionExists: false } };
}
