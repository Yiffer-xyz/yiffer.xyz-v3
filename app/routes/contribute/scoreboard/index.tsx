import type { ActionFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useFetcher } from '@remix-run/react';
import { useEffect, useState } from 'react';
import {
  MdArrowBack,
  MdArrowDropDown,
  MdArrowDropUp,
  MdArrowForward,
  MdHome,
} from 'react-icons/md';
import Button from '~/components/Buttons/Button';
import Link from '~/components/Link';
import { Table, TableBody, TableCell, TableHeadRow, TableRow } from '~/components/Table';
import Username from '~/components/Username';
import { alltimequery, defaultquery } from '~/mock-data/top-contributions';
import BackToContribute from '~/routes/contribute/BackToContribute';

export const action: ActionFunction = async function ({ request }) {
  const reqBody = await request.formData();
  const { type, month, year } = Object.fromEntries(reqBody);

  const response = type === 'alltime' ? alltimequery() : defaultquery(+month, +year);

  return json(response);
};

const arrowButtonClasses =
  'dark:bg-transparent dark:hover:bg-transparent bg-transparent hover:bg-transparent';

export default function Scoreboard() {
  const fetcher = useFetcher();
  const [showPointInfo, setShowPointInfo] = useState(false);
  const [showAllTime, setShowAllTime] = useState(false);
  const [date, setDate] = useState(new Date());

  const incrementMonth = () => {
    if (date.getMonth() === 11) {
      setDate(new Date(date.getFullYear() + 1, 0));
    } else {
      setDate(new Date(date.getFullYear(), date.getMonth() + 1));
    }
  };

  const decrementMonth = () => {
    if (date.getMonth() === 0) {
      setDate(new Date(date.getFullYear() - 1, 11));
    } else {
      setDate(new Date(date.getFullYear(), date.getMonth() - 1));
    }
  };

  const canIncrementMonth = () => {
    const now = new Date();
    return !(
      date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    );
  };

  const canDecrementMonth = () => {
    return !(date.getMonth() === 0 && date.getFullYear() === 2016);
  };

  const enabledClass = `
    dark:text-gray-100 text-gray-100 bg-gradient-to-r from-theme1-primary to-theme2-primary
  `;
  const disabledClass = `
    dark:text-white dark:bg-gray-500 dark:hover:bg-gray-300 dark:focus:bg-gray-300
    text-white bg-gray-700 hover:bg-gray-700 focus:bg-gray-700
  `;

  useEffect(() => {
    fetcher.submit(
      {
        type: showAllTime ? 'alltime' : 'default',
        month: date.getMonth() + '',
        year: date.getFullYear() + '',
      },
      { method: 'post' }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAllTime, date]);

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
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <a
          onClick={() => setShowPointInfo(!showPointInfo)}
          className="w-fit h-fit text-blue-weak-200 dark:text-blue-strong-300 font-semibold"
        >
          {showPointInfo ? 'Hide' : 'Show'} point info{' '}
          {showPointInfo ? <MdArrowDropUp /> : <MdArrowDropDown />}
        </a>
      </p>
      {showPointInfo && <PointInfo />}
      <div className="flex flex-col justify-center items-center w-fit mx-auto mt-8">
        <div className="flex mb-6">
          <Button
            text="Monthly"
            variant="contained"
            color="primary"
            className={
              'rounded-r-none' + disabledClass + (showAllTime ? '' : enabledClass)
            }
            onClick={() => setShowAllTime(false)}
          />
          <Button
            text="All time"
            variant="contained"
            color="primary"
            className={
              'rounded-l-none' + disabledClass + (showAllTime ? enabledClass : '')
            }
            onClick={() => setShowAllTime(true)}
          />
        </div>
        {!showAllTime && (
          <div className="flex justify-between w-full mb-2 text-lg">
            <Button
              startIcon={MdArrowBack}
              color="none"
              onClick={decrementMonth}
              disabled={!canDecrementMonth()}
              className={arrowButtonClasses}
            />
            {`${date.toLocaleString('default', {
              month: 'short',
            })} ${date.getFullYear()}`}
            <Button
              endIcon={MdArrowForward}
              color="none"
              onClick={incrementMonth}
              disabled={!canIncrementMonth()}
              className={arrowButtonClasses}
            />
          </div>
        )}
        {fetcher.data && (
          <Table>
            <TableHeadRow isTableMaxHeight>
              <TableCell>Username</TableCell>
              <TableCell>Score</TableCell>
            </TableHeadRow>
            <TableBody>
              {fetcher.data instanceof Array &&
                fetcher.data.map((entry, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Username user={entry.user} />
                    </TableCell>
                    <TableCell>{entry.points}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
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

const PointInfo = () => (
  <div className="flex gap-2 mt-4">
    <div className="font-bold">
      <p className={pInfoColors.pValues.green}>200</p>
      <p className={pInfoColors.pValues.green}>150</p>
      <p className={pInfoColors.pValues.green}>120</p>
      <p className={pInfoColors.pValues.green}>50</p>
      <p className={pInfoColors.pValues.blue}>30</p>
      <p className={pInfoColors.pValues.blue}>15</p>
      <p className={pInfoColors.pValues.purple}>10</p>
      <p className={pInfoColors.pValues.yellow}>5</p>
    </div>
    <div>
      <p className={pInfoColors.pDescriptions.green}>Uploaded comic, no issues found</p>
      <p className={pInfoColors.pDescriptions.green}>
        Uploaded comic, minor issues found(incorrect category/classification, wrong name)
      </p>
      <p className={pInfoColors.pDescriptions.green}>
        Uploaded comic, major issues found (lacking artist links, poor tagging, bad
        thumbnail)
      </p>
      <p className={pInfoColors.pDescriptions.green}>
        Uploaded comic, page issues (resolution, ordering, premium pages uploaded)
      </p>
      <p className={pInfoColors.pDescriptions.blue}>
        Comic suggestion approved with good links/information
      </p>
      <p className={pInfoColors.pDescriptions.blue}>
        Comic suggestion approved with lacking links/information
      </p>
      <p className={pInfoColors.pDescriptions.purple}>Comic problem reported</p>
      <p className={pInfoColors.pDescriptions.yellow}>
        Add/remove tag suggestion approved
      </p>
    </div>
  </div>
);
