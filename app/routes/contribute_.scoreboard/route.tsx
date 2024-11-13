import { unstable_defineAction, unstable_defineLoader } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { add, format, sub } from 'date-fns';
import { useState } from 'react';
import { MdArrowBack, MdArrowForward } from 'react-icons/md';
import IconButton from '~/ui-components/Buttons/IconButton';
import Checkbox from '~/ui-components/Checkbox/Checkbox';
import Spinner from '~/ui-components/Spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHeadRow,
  TableRow,
} from '~/ui-components/Table';
import Username from '~/ui-components/Username';
import { CONTRIBUTION_POINTS } from '~/types/contributions';
import type { ContributionPointsEntry, UserType } from '~/types/types';
import { queryDb } from '~/utils/database-facade';
import type { ResultOrErrorPromise } from '~/utils/request-helpers';
import { makeDbErrObj, processApiError } from '~/utils/request-helpers';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import ToggleButton from '~/ui-components/Buttons/ToggleButton';
import Breadcrumbs from '~/ui-components/Breadcrumbs/Breadcrumbs';
import ContributionPointInfo from '~/ui-components/ContributionPointInfo';
export { YifferErrorBoundary as ErrorBoundary } from '~/utils/error';

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
          yearMonth: activeCategory === 'All time' ? 'all-time' : format(date, 'yyyy-MM'),
          excludeMods,
          points: fetcher.data || [],
        },
      ]);
    },
  });

  const allTimePoints = useLoaderData<typeof loader>();

  const [activeCategory, setActiveCategory] = useState<'Monthly' | 'All time'>('Monthly');
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
    newCategory: 'Monthly' | 'All time' | undefined,
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

    if (newCategory) {
      setActiveCategory(newCategory);
    }
    if (newExcludeMods !== undefined) {
      setExcludeMods(newExcludeMods);
    }

    const excludeMonthsValForQuery =
      newExcludeMods === undefined ? excludeMods : newExcludeMods;

    let yearMonth = format(date, 'yyyy-MM');
    if (newCategory === 'All time') yearMonth = 'all-time';
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
    <div className="container mx-auto pb-8">
      <h1>Contributions scoreboard</h1>

      <Breadcrumbs
        prevRoutes={[{ text: 'Contribute', href: '/contribute' }]}
        currentRoute="Scoreboard"
      />

      <p>
        Points are awarded only when a contribution has been approved or accepted by a
        mod.
      </p>
      <p className="mb-6">
        Currently, these points can&apos;t be used for anything, and there are no concrete
        plans to change this, but who knows what the future holds?
      </p>

      <ContributionPointInfo />

      <div className="flex flex-col justify-center sm:justify-normal items-center w-fit mx-auto sm:mx-0 mt-8">
        <Checkbox
          label="Include mods"
          checked={!excludeMods}
          onChange={() => changeDisplayInterval(undefined, undefined, !excludeMods)}
          className="mb-4"
        />

        <ToggleButton
          className="mb-4"
          buttons={[
            { text: 'Monthly', value: 'Monthly' },
            { text: 'All time', value: 'All time' },
          ]}
          value={activeCategory}
          onChange={(value: 'Monthly' | 'All time') => {
            setActiveCategory(value);
            changeDisplayInterval(undefined, value, undefined);
          }}
        />

        {activeCategory === 'Monthly' && (
          <div className="flex justify-between items-center w-fit mb-2 text-lg">
            <IconButton
              icon={MdArrowBack}
              onClick={() => changeDisplayInterval(-1, undefined, undefined)}
              disabled={fetcher.isLoading}
              variant="naked"
            />

            {format(date, 'MMM y')}

            <IconButton
              icon={MdArrowForward}
              onClick={() => changeDisplayInterval(1, undefined, undefined)}
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

export const loader = unstable_defineLoader(async args => {
  const scoresRes = await getTopScores(args.context.cloudflare.env.DB, undefined, false);
  if (scoresRes.err) {
    return processApiError('Error in loader of contribution scoreboard', scoresRes.err);
  }
  return { topScores: scoresRes.result };
});

export const action = unstable_defineAction(async args => {
  const reqBody = await args.request.formData();
  const { yearMonth, excludeMods } = Object.fromEntries(reqBody);
  const yearMonthStr = yearMonth.toString();
  const res = await getTopScores(
    args.context.cloudflare.env.DB,
    yearMonthStr === 'all-time' ? undefined : yearMonthStr,
    excludeMods === 'true'
  );
  if (res.err) {
    return processApiError('Error in action of contribution scoreboard', res.err);
  }
  return {
    success: true,
    data: res.result,
    error: null,
  };
});

type TopContributionPointsRow = {
  userId: number;
  username: string;
  userType: UserType;
  points: number;
};

async function getTopScores(
  db: D1Database,
  yearMonth: string | undefined,
  excludeMods: boolean
): ResultOrErrorPromise<TopContributionPointsRow[]> {
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
    ${yearMonth ? 'WHERE yearMonth = ?' : ''}
    ${excludeMods ? `AND userType != 'moderator' AND userType != 'admin'` : ''}
  `;

  const dbRes = await queryDb<ContributionPointsEntry[]>(
    db,
    query,
    yearMonth ? [yearMonth] : undefined
  );
  if (dbRes.isError) {
    return makeDbErrObj(dbRes, 'Error getting top score list', {
      yearMonth,
      excludeMods,
    });
  }
  return {
    result: topScoreEntriesToPointList(dbRes.result),
  };
}

function topScoreEntriesToPointList(
  entries: ContributionPointsEntry[]
): TopContributionPointsRow[] {
  const topScoreRows: TopContributionPointsRow[] = entries.map(userContrib => {
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
