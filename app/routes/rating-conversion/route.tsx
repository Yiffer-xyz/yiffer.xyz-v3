import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { useState } from 'react';
import type { ConvertOldRatingsBody } from '~/routes/api.convert-old-ratings';
import { getOldComicRatingSummary } from '~/route-funcs/get-old-comic-ratings';
import Breadcrumbs from '~/ui-components/Breadcrumbs/Breadcrumbs';
import Button from '~/ui-components/Buttons/Button';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import Checkbox from '~/ui-components/Checkbox/Checkbox';
import InfoBox from '~/ui-components/InfoBox';
import Select from '~/ui-components/Select/Select';
import {
  Table,
  TableBody,
  TableCell,
  TableHeadRow,
  TableRow,
} from '~/ui-components/Table';
import { redirectIfNotLoggedIn } from '~/utils/loaders';
import { processApiError } from '~/utils/request-helpers';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import posthog from 'posthog-js';

export function shouldRevalidate() {
  return false;
}

export async function loader(args: LoaderFunctionArgs) {
  const user = await redirectIfNotLoggedIn(args);

  const oldComicRatingsRes = await getOldComicRatingSummary(
    args.context.cloudflare.env.DB,
    user.userId
  );

  if (oldComicRatingsRes.err) {
    return processApiError(
      'Error getting old comic ratings in /rating-conversion',
      oldComicRatingsRes.err
    );
  }

  return {
    oldComicRatings: oldComicRatingsRes.result,
  };
}

export default function RatingConversion() {
  const { oldComicRatings } = useLoaderData<typeof loader>();

  const [conversions, setConversions] = useState<
    {
      oldRating: number;
      newRating: string;
      bookmark: boolean;
    }[]
  >(
    oldComicRatings.map(rating => ({
      oldRating: rating.rating,
      newRating: '0',
      bookmark: false,
    }))
  );

  const [isDiscarding, setIsDiscarding] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [validationErrorMessage, setValidationErrorMessage] = useState<string | null>(
    null
  );

  const convertRatingsFetcher = useGoodFetcher({
    url: '/api/convert-old-ratings',
    method: 'post',
    onFinish: () => setIsSuccess(true),
  });

  function discardRatings() {
    posthog.capture('Old ratings discarded');

    const conversionsBody: ConvertOldRatingsBody = { conversions: [] };
    convertRatingsFetcher.submit({ body: JSON.stringify(conversionsBody) });
  }

  function convertRatings() {
    posthog.capture('Old ratings converted');
    const validation = validateConversions(conversions);
    setValidationErrorMessage(validation.error ?? null);
    if (!validation.isValid) {
      return;
    }

    const conversionsBody: ConvertOldRatingsBody = {
      conversions: conversions
        .filter(c => c.newRating !== '0')
        .map(c => ({
          oldRating: c.oldRating,
          newRating: parseInt(c.newRating),
          bookmark: c.bookmark,
        })),
    };
    convertRatingsFetcher.submit({ body: JSON.stringify(conversionsBody) });
  }

  return (
    <div className="container mx-auto pb-16">
      <h1>Rating Conversion</h1>

      <Breadcrumbs
        prevRoutes={[{ href: '/browse', text: 'Browse' }]}
        currentRoute="Rating Conversion"
      />

      {isSuccess && (
        <InfoBox variant="success" className="mt-4" boldText fitWidth>
          Successfully {isDiscarding ? 'discarded' : 'converted'} ratings!
        </InfoBox>
      )}

      {!isSuccess && (
        <div className="flex flex-col gap-4">
          <p>
            In early 2025, we made a complete overhaul of the site. This included a new
            comic rating system. You can read the full explanation of it in a future blog
            post, but for now, here's a quick summary:
          </p>
          <p>
            We've gone from a 1-10 rating system to a 1-3 stars system. In addition we've
            added a "bookmark" feature if you prefer to keep track of your favorite comics
            that way.
          </p>
          <p>
            The rationale behind this change is that people weren't using the old system
            properly. If you're disappointed by this change, We're sorry. We know there
            will be some of you, but this change will be an improvement for the vast
            majority of users - we hope you'll understand.
          </p>
          <p>
            We recommend converting high ratings to stars, and discarding low ratings if
            there are any. The new system does not have the equivalent of a "1" in the old
            system. Now, even a single star should indicate that you like the comic.
          </p>

          {!isDiscarding && !isConverting && (
            <div className="flex flex-row gap-4 flex-wrap">
              <Button
                text="Set up rating conversion"
                onClick={() => setIsConverting(true)}
              />
              <Button
                text="Discard all old ratings"
                color="error"
                onClick={() => setIsDiscarding(true)}
              />
            </div>
          )}

          {isDiscarding && (
            <div>
              <p className="font-bold">
                Are you sure you want to discard all old ratings?
              </p>
              <div className="flex flex-row gap-4 mt-1 flex-wrap">
                <Button
                  text="No, convert ratings"
                  onClick={() => setIsDiscarding(false)}
                />
                <LoadingButton
                  text="Yes, discard ratings"
                  color="error"
                  onClick={discardRatings}
                  isLoading={convertRatingsFetcher.isLoading}
                />
              </div>
            </div>
          )}

          {isConverting && (
            <div>
              <Table>
                <TableHeadRow>
                  <TableCell>Old rating (& num. comics)</TableCell>
                  <TableCell>New rating</TableCell>
                  <TableCell>Bookmark?</TableCell>
                </TableHeadRow>
                <TableBody>
                  {oldComicRatings.map(rating => (
                    <TableRow key={rating.rating}>
                      <TableCell>
                        <b>{rating.rating}</b>{' '}
                        <span className="text-sm">({rating.count})</span>
                      </TableCell>
                      <TableCell>
                        <Select
                          name="newRating"
                          options={[
                            { value: '0', text: 'None' },
                            { value: '1', text: '1 star' },
                            { value: '2', text: '2 stars' },
                            { value: '3', text: '3 stars' },
                          ]}
                          value={
                            conversions.find(c => c.oldRating === rating.rating)
                              ?.newRating ?? 0
                          }
                          onChange={value => {
                            setConversions(prev =>
                              prev.map(c =>
                                c.oldRating === rating.rating
                                  ? {
                                      ...c,
                                      newRating: value as string,
                                    }
                                  : c
                              )
                            );
                          }}
                        />
                      </TableCell>
                      <TableCell className="flex-row flex justify-center">
                        <Checkbox
                          className="p-0 m-0 mt-2"
                          disabled={
                            conversions.find(c => c.oldRating === rating.rating)
                              ?.newRating === '0'
                          }
                          checked={
                            conversions.find(c => c.oldRating === rating.rating)
                              ?.bookmark ?? false
                          }
                          onChange={() => {
                            setConversions(prev =>
                              prev.map(c =>
                                c.oldRating === rating.rating
                                  ? { ...c, bookmark: !c.bookmark }
                                  : c
                              )
                            );
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <p className="mt-2 text-sm">
                "None" means discarding all ratings of comics with the given rating.
              </p>
              <p className="text-sm">
                If you already have a rating for a comic in the new system, it will not be
                overwritten.
              </p>

              {validationErrorMessage && (
                <InfoBox variant="error" className="mt-4" boldText={false} fitWidth>
                  {validationErrorMessage}
                </InfoBox>
              )}

              {!isSubmitting && (
                <Button
                  text="Submit rating conversions"
                  onClick={() => setIsSubmitting(true)}
                  className="mt-4"
                />
              )}
              {isSubmitting && (
                <div className="mt-3">
                  <p className="font-bold">
                    Are you sure you want to submit these changes? This is a one-time
                    operation that cannot be undone.
                  </p>
                  <p className="text-sm">
                    Of course, you can change the comic ratings individually at any time,
                    but this conversion from the old system will only happen once.
                  </p>
                  <div className="flex flex-row gap-4 mt-1">
                    <Button
                      text="Back"
                      onClick={() => setIsSubmitting(false)}
                      variant="outlined"
                    />
                    <LoadingButton
                      text="Submit rating conversions"
                      onClick={convertRatings}
                      isLoading={convertRatingsFetcher.isLoading}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Make sure that if an old rating is higher than another, its new rating is equal or higher.
// Ignore 0s.
function validateConversions(
  conversions: {
    oldRating: number;
    newRating: string;
    bookmark: boolean;
  }[]
): {
  isValid: boolean;
  error?: string;
} {
  for (let i = 0; i < conversions.length; i++) {
    for (let j = i + 1; j < conversions.length; j++) {
      if (conversions[i].newRating === '0' || conversions[j].newRating === '0') {
        continue;
      }
      if (conversions[i].oldRating > conversions[j].oldRating) {
        if (conversions[i].newRating < conversions[j].newRating) {
          return {
            isValid: false,
            error: `Error: Old rating ${conversions[i].oldRating} is higher than ${conversions[j].oldRating}, but its new rating ${conversions[i].newRating} is lower than the other's new ${conversions[j].newRating}.`,
          };
        }
      }
    }
  }

  return {
    isValid: true,
  };
}
