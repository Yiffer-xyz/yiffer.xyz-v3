import { useLoaderData } from '@remix-run/react';
import { add, format, sub } from 'date-fns';
import { useState } from 'react';
import { MdArrowBack, MdArrowForward } from 'react-icons/md';
import IconButton from '~/ui-components/Buttons/IconButton';
import Spinner from '~/ui-components/Spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHeadRow,
  TableRow,
} from '~/ui-components/Table';
import { CONTRIBUTION_POINTS } from '~/types/contributions';
import type { ContributionPointsEntry } from '~/types/types';
import { queryDb } from '~/utils/database-facade';
import type { ResultOrErrorPromise } from '~/utils/request-helpers';
import { makeDbErrObj, processApiError } from '~/utils/request-helpers';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import ToggleButton from '~/ui-components/Buttons/ToggleButton';
import Breadcrumbs from '~/ui-components/Breadcrumbs/Breadcrumbs';
import ContributionPointInfo from '~/ui-components/ContributionPointInfo';
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/cloudflare';
import { getModScoreboard } from '~/route-funcs/get-mod-scoreboard';
export { YifferErrorBoundary as ErrorBoundary } from '~/utils/error';

export const meta: MetaFunction = () => {
  return [{ title: `Scoreboard | Yiffer.xyz` }];
};

type CachedPoints = {
  yearMonth?: string;
  isModScores?: boolean;
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
          isModScores: activeCategory === 'Mods',
          points: fetcher.data || [],
        },
      ]);
    },
  });

  const allTimePoints = useLoaderData<typeof loader>();

  const [activeCategory, setActiveCategory] = useState<'Monthly' | 'All time' | 'Mods'>(
    'Monthly'
  );
  const [date, setDate] = useState(new Date());

  const [points, setPoints] = useState<TopContributionPointsRow[]>(
    allTimePoints.topScores || []
  );

  const [cachedPoints, setCachedPoints] = useState<CachedPoints[]>([
    {
      yearMonth: format(new Date(), 'yyyy-MM'),
      points: allTimePoints.topScores || [],
    },
  ]);

  function changeDisplayInterval(
    incrementBy: 1 | -1 | undefined,
    newCategory: 'Monthly' | 'All time' | 'Mods' | undefined
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

    let yearMonth = format(date, 'yyyy-MM');
    let isModScores = false;
    if (newCategory === 'All time' || (!newCategory && activeCategory === 'All time')) {
      yearMonth = 'all-time';
    } else if (newCategory === 'Mods') {
      isModScores = true;
    } else if (incrementBy !== undefined) {
      yearMonth = format(newDate, 'yyyy-MM');
    }

    const foundCachedPoints = isModScores
      ? cachedPoints.find(cp => cp.isModScores)
      : cachedPoints.find(cp => cp.yearMonth === yearMonth);

    console.log('foundCachedPoints', foundCachedPoints);
    if (foundCachedPoints) {
      setPoints(foundCachedPoints.points);
      return;
    }

    fetcher.submit({ yearMonth, isModScores });
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

      <div className="flex flex-col justify-start min-w-[300px] mx-auto sm:mx-0 mt-8">
        <ToggleButton
          className="mb-4"
          buttons={[
            { text: 'Monthly', value: 'Monthly' },
            { text: 'All time', value: 'All time' },
            { text: 'Mods', value: 'Mods' },
          ]}
          value={activeCategory}
          onChange={(value: 'Monthly' | 'All time' | 'Mods') => {
            setActiveCategory(value);
            changeDisplayInterval(undefined, value);
          }}
        />

        {activeCategory === 'Monthly' && (
          <div className="flex justify-between items-center w-fit mb-2 text-lg">
            <IconButton
              icon={MdArrowBack}
              onClick={() => changeDisplayInterval(-1, undefined)}
              disabled={fetcher.isLoading}
              variant="naked"
            />

            {format(date, 'MMM y')}

            <IconButton
              icon={MdArrowForward}
              onClick={() => changeDisplayInterval(1, undefined)}
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
              <TableCell>{activeCategory === 'Mods' ? 'Mod' : 'User'}</TableCell>
              <TableCell>Score</TableCell>
            </TableHeadRow>
            <TableBody>
              {points.map((point, i) => (
                <TableRow key={i}>
                  <TableCell>{point.username}</TableCell>
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

export async function loader(args: LoaderFunctionArgs) {
  const scoresRes = await getTopScores(
    args.context.cloudflare.env.DB,
    format(new Date(), 'yyyy-MM'),
    true
  );
  if (scoresRes.err) {
    return processApiError('Error in loader of contribution scoreboard', scoresRes.err);
  }
  return { topScores: scoresRes.result };
}

export async function action(args: ActionFunctionArgs) {
  const reqBody = await args.request.formData();
  const { yearMonth, isModScores } = Object.fromEntries(reqBody);
  const yearMonthStr = yearMonth.toString();
  const isModScoresBool = isModScores.toString() === 'true';

  console.log('isModScoresBool', isModScoresBool);
  console.log('yearMonthStr', yearMonthStr);

  let scores: TopContributionPointsRow[] = [];
  if (isModScoresBool) {
    const res = await getModScoreboard(args.context.cloudflare.env.DB);
    if (res.err) {
      return processApiError('Error in action of contribution scoreboard', res.err);
    }
    scores = res.result;
  } else {
    const res = await getTopScores(args.context.cloudflare.env.DB, yearMonthStr, true);
    if (res.err) {
      return processApiError('Error in action of contribution scoreboard', res.err);
    }
    scores = res.result;
  }

  return {
    success: true,
    data: scores,
    error: null,
  };
}

type TopContributionPointsRow = {
  userId: number;
  username: string;
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
    yearMonth ? [yearMonth] : undefined,
    'Contrib scoreboard, top scores'
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
      points,
    };
  });

  return topScoreRows.sort((a, b) => b.points - a.points).filter(row => row.points > 0);
}
