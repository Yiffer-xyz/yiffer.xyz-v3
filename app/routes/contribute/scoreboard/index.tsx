import type { ActionArgs, LoaderArgs } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { add, format, sub } from 'date-fns';
import { Fragment, useState } from 'react';
import {
  MdArrowBack,
  MdArrowDropDown,
  MdArrowDropUp,
  MdArrowForward,
  MdHome,
} from 'react-icons/md';
import Button from '~/components/Buttons/Button';
import IconButton from '~/components/Buttons/IconButton';
import Checkbox from '~/components/Checkbox/Checkbox';
import Link from '~/components/Link';
import Spinner from '~/components/Spinner';
import { Table, TableBody, TableCell, TableHeadRow, TableRow } from '~/components/Table';
import Username from '~/components/Username';
import BackToContribute from '~/routes/contribute/BackToContribute';
import { CONTRIBUTION_POINTS } from '~/types/contributions';
import { ContributionPointsEntry, UserType } from '~/types/types';
import { queryDb } from '~/utils/database-facade';
import {
  ApiError,
  ApiResponse,
  makeDbErrObj,
  processApiError,
} from '~/utils/request-helpers';
import { useGoodFetcher } from '~/utils/useGoodFetcher';

type CachedPoints = {
  yearMonth: string;
  excludeMods: boolean;
  points: TopContributionPointsRow[];
};

export default function Scoreboard() {
  const fetcher = useGoodFetcher<TopContributionPointsRow[]>({
    method: 'post',
    onFinish: () => {
      setPoints(fetcher.data || []);
      setCachedPoints(prev => [
        ...prev,
        {
          yearMonth: showAllTime ? 'all-time' : format(date, 'yyyy-MM'),
          excludeMods,
          points: fetcher.data || [],
        },
      ]);
    },
  });
  const allTimePoints = useLoaderData<typeof loader>();

  const [showPointInfo, setShowPointInfo] = useState(false);
  const [showAllTime, setShowAllTime] = useState(false);
  const [excludeMods, setExcludeMods] = useState(false);
  const [date, setDate] = useState(new Date());

  const [points, setPoints] = useState<TopContributionPointsRow[]>(
    allTimePoints.topScores || []
  );

  const [cachedPoints, setCachedPoints] = useState<CachedPoints[]>([
    {
      yearMonth: format(new Date(), 'yyyy-MM'),
      excludeMods: false,
      points: allTimePoints.topScores || [],
    },
  ]);

  function changeDisplayInterval(
    incrementBy: 1 | -1 | undefined,
    setAllTime: boolean | undefined,
    newExcludeMods: boolean | undefined
  ) {
    let newDate = new Date();
    if (incrementBy === 1) {
      newDate = add(date, { months: 1 });
      setDate(newDate);
    }
    if (incrementBy === -1) {
      newDate = sub(date, { months: 1 });
      setDate(newDate);
    }

    if (setAllTime !== undefined) {
      setShowAllTime(setAllTime);
    }
    if (newExcludeMods !== undefined) {
      setExcludeMods(newExcludeMods);
    }

    const excludeMonthsValForQuery =
      newExcludeMods === undefined ? excludeMods : newExcludeMods;

    let yearMonth = format(date, 'yyyy-MM');
    if (setAllTime) yearMonth = 'all-time';
    if (incrementBy !== undefined) yearMonth = format(newDate, 'yyyy-MM');

    const foundCachedPoints = cachedPoints.find(
      cp => cp.yearMonth === yearMonth && cp.excludeMods === excludeMonthsValForQuery
    );

    if (foundCachedPoints) {
      setPoints(foundCachedPoints.points);
      return;
    }

    fetcher.submit({ yearMonth, excludeMods: excludeMonthsValForQuery.toString() });
  }

  const canIncrementMonth =
    !(
      date.getMonth() === new Date().getMonth() &&
      date.getFullYear() === new Date().getFullYear()
    ) && !fetcher.isLoading;

  return (
    <div className="container mx-auto justify-items-center">
      <h1 className="text-center mb-2">Contributions scoreboard</h1>
      <p className="text-center">
        <BackToContribute />
      </p>
      <p className="mb-4 text-center">
        <Link href="https://yiffer.xyz/" text="To front page" Icon={MdHome} />
      </p>

      <p>
        Points are awarded only when a contribution has been approved or accepted by a
        mod.
      </p>
      <p className="mb-6">
        Currently, these points can&apos;t be used for anything, and there are no concrete
        plans to change this, but who knows what the future holds?
      </p>

      <p className="text-center">
        <button
          onClick={() => setShowPointInfo(!showPointInfo)}
          className={`w-fit h-fit text-blue-weak-200 dark:text-blue-strong-300 font-semibold
          bg-gradient-to-r from-blue-weak-200 to-blue-weak-200
          dark:from-blue-strong-300 dark:to-blue-strong-300 bg-no-repeat
          focus:no-underline cursor-pointer bg-[length:0%_1px] transition-[background-size]
          duration-200 bg-[center_bottom] hover:bg-[length:100%_1px]`}
        >
          {showPointInfo ? 'Hide' : 'Show'} point info{' '}
          {showPointInfo ? <MdArrowDropUp /> : <MdArrowDropDown />}
        </button>
      </p>

      {showPointInfo && <PointInfo />}

      <div className="flex flex-col justify-center items-center w-fit mx-auto mt-8">
        <Checkbox
          label="Include mods"
          checked={!excludeMods}
          onChange={() => changeDisplayInterval(undefined, undefined, !excludeMods)}
          className="mb-4"
        />

        <div className="flex mb-4">
          <Button
            text="Monthly"
            variant="contained"
            color="primary"
            className={
              'rounded-r-none' + disabledClass + (showAllTime ? '' : enabledClass)
            }
            onClick={() => changeDisplayInterval(undefined, false, undefined)}
          />
          <Button
            text="All time"
            variant="contained"
            color="primary"
            className={
              'rounded-l-none' + disabledClass + (showAllTime ? enabledClass : '')
            }
            onClick={() => changeDisplayInterval(undefined, true, undefined)}
          />
        </div>

        {!showAllTime && (
          <div className="flex justify-between items-center w-fit mb-2 text-lg">
            <IconButton
              icon={MdArrowBack}
              onClick={() => changeDisplayInterval(-1, false, undefined)}
              disabled={fetcher.isLoading}
              variant="naked"
            />

            {format(date, 'MMM y')}

            <IconButton
              icon={MdArrowForward}
              onClick={() => changeDisplayInterval(1, false, undefined)}
              disabled={!canIncrementMonth}
              variant="naked"
            />
          </div>
        )}

        {fetcher.isLoading && <Spinner />}

        {points.length === 0 && !fetcher.isLoading && (
          <p>There are contributions for this month.</p>
        )}

        {points.length > 0 && !fetcher.isLoading && (
          <Table className="mb-6">
            <TableHeadRow isTableMaxHeight>
              <TableCell>User</TableCell>
              <TableCell>Score</TableCell>
            </TableHeadRow>
            <TableBody>
              {points.map((point, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Username
                      user={{
                        username: point.username,
                        id: point.userId,
                        userType: point.userType,
                      }}
                    />
                  </TableCell>
                  <TableCell>{point.points}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

export async function loader(args: LoaderArgs) {
  const scoresRes = await getTopScores(
    args.context.DB_API_URL_BASE as string,
    'all-time',
    false
  );
  if (scoresRes.err) {
    return processApiError('Error in loader of contribution scoreboard', scoresRes.err);
  }
  return scoresRes;
}

export async function action(
  args: ActionArgs
): Promise<ApiResponse<TopContributionPointsRow[]>> {
  const reqBody = await args.request.formData();
  const { yearMonth, excludeMods } = Object.fromEntries(reqBody);
  const res = await getTopScores(
    args.context.DB_API_URL_BASE as string,
    yearMonth.toString(),
    excludeMods === 'true'
  );
  if (res.err) {
    return processApiError('Error in action of contribution scoreboard', res.err);
  }
  return {
    success: true,
    data: res.topScores,
    error: null,
  };
}

type TopContributionPointsRow = {
  userId: number;
  username: string;
  userType: UserType;
  points: number;
};

async function getTopScores(
  urlBase: 'all-time' | string,
  yearMonth: string,
  excludeMods: boolean
): Promise<{ topScores?: TopContributionPointsRow[]; err?: ApiError }> {
  const query = `
    SELECT 
      user.id AS userId, 
      user.username,
      user.userType,
      tagSuggestion,
      comicProblem,
      comicSuggestiongood,
      comicSuggestionbad,
      comicUploadexcellent,
      comicUploadminorissues,
      comicUploadmajorissues,
      comicUploadpageissues,
      comicUploadterrible
    FROM contributionpoints
    INNER JOIN user ON (user.id = contributionpoints.userId)
    WHERE yearMonth = ?
    ${excludeMods ? `AND userType != 'moderator' AND userType != 'admin'` : ''}
  `;

  const dbRes = await queryDb<ContributionPointsEntry[]>(urlBase, query, [yearMonth]);
  if (dbRes.errorMessage) {
    return makeDbErrObj(dbRes, 'Error getting top score list', {
      yearMonth,
      excludeMods,
    });
  }
  return {
    topScores: topScoreEntriesToPointList(dbRes.result!),
  };
}

function topScoreEntriesToPointList(
  entries: ContributionPointsEntry[]
): TopContributionPointsRow[] {
  let topScoreRows: TopContributionPointsRow[] = entries.map(userContrib => {
    const points =
      userContrib.tagSuggestion * CONTRIBUTION_POINTS.tagSuggestion.points +
      userContrib.comicProblem * CONTRIBUTION_POINTS.comicProblem.points +
      userContrib.comicSuggestiongood * CONTRIBUTION_POINTS.comicSuggestion.good.points +
      userContrib.comicSuggestionbad * CONTRIBUTION_POINTS.comicSuggestion.bad.points +
      userContrib.comicUploadexcellent *
        CONTRIBUTION_POINTS.comicUpload.excellent.points +
      userContrib.comicUploadminorissues *
        CONTRIBUTION_POINTS.comicUpload['minor-issues'].points +
      userContrib.comicUploadmajorissues *
        CONTRIBUTION_POINTS.comicUpload['major-issues'].points +
      userContrib.comicUploadpageissues *
        CONTRIBUTION_POINTS.comicUpload['page-issues'].points +
      userContrib.comicUploadterrible * CONTRIBUTION_POINTS.comicUpload.terrible.points;

    return {
      userId: userContrib.userId,
      username: userContrib.username,
      userType: userContrib.userType,
      points,
    };
  });

  return topScoreRows;
}

const pInfoColors = {
  pValues: {
    green: 'dark:text-green-600 text-green-700',
    blue: 'dark:text-blue-600 text-blue-700',
    purple: 'dark:text-purple-600 text-purple-700',
    yellow: 'dark:text-yellow-500 text-yellow-600',
  },
  pDescriptions: {
    green: 'dark:text-green-400 text-green-600',
    blue: 'dark:text-blue-400 text-blue-600',
    purple: 'dark:text-purple-400 text-purple-600',
    yellow: 'dark:text-yellow-200 text-yellow-500',
  },
};

const enabledClass = `
    dark:text-gray-100 text-gray-100 bg-gradient-to-r from-theme1-primary to-theme2-primary
  `;
const disabledClass = `
    dark:text-white dark:bg-gray-500 dark:hover:bg-gray-300 dark:focus:bg-gray-300
    text-white bg-gray-700 hover:bg-gray-700 focus:bg-gray-700
  `;

const nonRejectedUploads = Object.entries(CONTRIBUTION_POINTS.comicUpload)
  .filter(([verdict]) => verdict !== 'rejected' && verdict !== 'rejected-list')
  .map(([_, value]) => ({
    points: value.points,
    text: value.scoreListDescription,
  }));

export function PointInfo({ showInfoAboutUploadedComics = false }) {
  return (
    <>
      <div
        className="grid gap-y-1 gap-x-2 mt-4 mx-auto w-fit"
        style={{ gridTemplateColumns: 'auto auto' }}
      >
        {nonRejectedUploads.map(({ points, text }) => (
          <Fragment key={points}>
            <p className={pInfoColors.pValues.green}>
              <b>{points}</b>
            </p>
            <p className={pInfoColors.pDescriptions.green}>{text}</p>
          </Fragment>
        ))}

        <p className={pInfoColors.pValues.blue}>
          <b>30</b>
        </p>
        <p className={pInfoColors.pDescriptions.blue}>
          Comic suggestion approved with good links/information
        </p>

        <p className={pInfoColors.pValues.blue}>
          <b>15</b>
        </p>
        <p className={pInfoColors.pDescriptions.blue}>
          Comic suggestion approved with lacking links/information
        </p>

        <p className={pInfoColors.pValues.purple}>
          <b>10</b>
        </p>
        <p className={pInfoColors.pDescriptions.purple}>Comic problem reported</p>

        <p className={pInfoColors.pValues.yellow}>
          <b>5</b>
        </p>
        <p className={pInfoColors.pDescriptions.yellow}>
          Add/remove tag suggestion approved
        </p>
      </div>
      {showInfoAboutUploadedComics && (
        <p className="mt-4 text-center">
          Note that even if your comic upload has the status Approved it might still not
          be available on the site. This is because we queue comics to spread them evenly
          over time.
        </p>
      )}
    </>
  );
}
