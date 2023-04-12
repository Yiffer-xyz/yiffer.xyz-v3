import { LoaderArgs } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { format } from 'date-fns';
import { useMemo, useState } from 'react';
import { MdArrowDownward, MdArrowUpward, MdCheck, MdError } from 'react-icons/md';
import LoadingButton from '~/components/Buttons/LoadingButton';
import LoadingIconButton from '~/components/Buttons/LoadingIconButton';
import Link from '~/components/Link';
import RadioButtonGroup from '~/components/RadioButton/RadioButtonGroup';
import { DbPendingComic } from '~/types/types';
import { processApiError } from '~/utils/request-helpers';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import useWindowSize from '~/utils/useWindowSize';
import { getPendingComics } from '../api/funcs/get-pending-comics';

type PendingComicsFilter = 'all' | 'scheduled' | 'unscheduled' | 'problematic';

const filterOptions: { value: PendingComicsFilter; text: string }[] = [
  { value: 'all', text: 'All' },
  { value: 'scheduled', text: 'Publishing queue' },
  { value: 'unscheduled', text: 'Unscheduled only' },
  { value: 'problematic', text: 'Problematic only' },
];

export default function PendingComics() {
  const { pendingComics, dailySchedulePublishCount } = useLoaderData<typeof loader>();
  const { isMobile } = useWindowSize();
  const moveUpFetcher = useGoodFetcher({
    url: '/api/admin/move-queued-comic',
    method: 'post',
  });
  const moveDownFetcher = useGoodFetcher({
    url: '/api/admin/move-queued-comic',
    method: 'post',
  });
  const recalculateFetcher = useGoodFetcher({
    url: '/api/admin/recalculate-publishing-queue',
    method: 'post',
    toastSuccessMessage: 'Successfully recalculated queue',
  });

  const [filter, setFilter] = useState<PendingComicsFilter>('all');

  const totalPublishingQueueLength = useMemo(
    () => pendingComics.filter(comic => comic.publishingQueuePos).length,
    [pendingComics]
  );

  function moveComic(comicId: number, direction: 'up' | 'down') {
    if (direction === 'up') {
      moveUpFetcher.submit({ comicId: comicId.toString(), direction: 'up' });
    }
    if (direction === 'down') {
      moveDownFetcher.submit({ comicId: comicId.toString(), direction: 'down' });
    }
  }

  const filteredComics = useMemo(() => {
    if (filter === 'all') {
      return pendingComics;
    }

    // When viewing the publishing queue, sort by publishingQueuePos instead of timestamp
    if (filter === 'scheduled') {
      return pendingComics
        .filter(comic => comic.publishStatus === 'scheduled')
        .sort((a, b) => {
          if (a.publishingQueuePos && b.publishingQueuePos) {
            return a.publishingQueuePos - b.publishingQueuePos;
          }
          if (a.publishingQueuePos) {
            return 1;
          }
          if (b.publishingQueuePos) {
            return -1;
          }
          return 0;
        });
    }

    if (filter === 'unscheduled') {
      return pendingComics.filter(
        comic => comic.publishStatus === 'pending' && !isProblematic(comic)
      );
    }

    if (filter === 'problematic') {
      return pendingComics.filter(comic => isProblematic(comic));
    }

    return pendingComics;
  }, [filter, pendingComics]);

  return (
    <>
      <h1>Pending comics</h1>
      <p>
        This is the home of comics that have been uploaded by mods, or by users and then
        passed a mod review.
      </p>
      <p className="mt-2">
        Only admins can set schedule pending comics for publishing or add them to the
        publishing queue.
      </p>
      <p className="mt-2">
        Comics in the publishing queue are published daily at noon, ET.{' '}
        <b>{dailySchedulePublishCount}</b> comics are scheduled daily, as long as there
        are enough in the queue.
      </p>

      <div className="flex flex-row flex-wrap my-4">
        <RadioButtonGroup
          direction={isMobile ? 'vertical' : 'horizontal'}
          options={filterOptions}
          value={filter}
          onChange={val => setFilter(val)}
          name="filter"
        />
      </div>

      {filter === 'scheduled' && (
        <>
          <LoadingButton
            isLoading={recalculateFetcher.isLoading}
            onClick={() => recalculateFetcher.submit()}
            text="Recalculate publishing queue positions"
          />
          <p className="text-sm mb-4">
            In case some comics are missing placement or something else is wrong
          </p>
        </>
      )}

      <div className={`flex flex-col gap-2 ${isMobile ? 'w-full' : 'w-fit'}`}>
        {filteredComics.map(comic => {
          const nameLink = (
            <Link
              href={`/admin/comics/${comic.comicId}`}
              text={`${comic.comicName} - ${comic.artistName}`}
            />
          );

          const publishedP = comic.publishStatus === 'scheduled' && comic.publishDate && (
            <p>
              <MdCheck /> Scheduled: {format(new Date(comic.publishDate), 'MMM do')}
            </p>
          );

          const scheduledP = comic.publishStatus === 'scheduled' &&
            !comic.publishDate && (
              <div className="flex flex-row items-center">
                <p>
                  <MdCheck /> Publishing queue, {comic.publishingQueuePos ?? '?'}/
                  {totalPublishingQueueLength}
                </p>
                <LoadingIconButton
                  icon={MdArrowDownward}
                  variant="naked"
                  isLoading={moveDownFetcher.isLoading}
                  onClick={() => moveComic(comic.comicId, 'down')}
                  disabled={comic.publishingQueuePos === totalPublishingQueueLength}
                  className="ml-2"
                />
                <LoadingIconButton
                  icon={MdArrowUpward}
                  variant="naked"
                  isLoading={moveUpFetcher.isLoading}
                  disabled={comic.publishingQueuePos === 1}
                  onClick={() => moveComic(comic.comicId, 'up')}
                />
              </div>
            );

          const noTagsP = comic.numberOfTags === 0 && (
            <p>
              <MdError /> No tags
            </p>
          );

          const errorP = comic.errorText && (
            <p>
              <MdError /> Error: {comic.errorText}
              {comic.pendingProblemModId && <span> (mod has been assigned)</span>}
            </p>
          );

          const addedReviewerP = (
            <p>
              Added by {comic.uploadUsername || comic.uploadUserIP},{' '}
              {format(new Date(comic.timestamp), 'MMM do')}
              {comic.reviewerModName && <> - reviewer: {comic.reviewerModName}</>}
            </p>
          );

          const scheduledByP = comic.scheduleModName && (
            <p>Scheduled by: {comic.scheduleModName}</p>
          );

          return (
            <div
              className={`flex flex-row shadow rounded-sm justify-between gap-x-6 px-3 py-2 ${getBgColor(
                comic
              )}`}
              key={comic.comicId}
            >
              {isMobile ? (
                <div>
                  {nameLink}
                  {publishedP}
                  {scheduledP}
                  {noTagsP}
                  {errorP}
                  <p>
                    Added by {comic.uploadUsername || comic.uploadUserIP},{' '}
                    {format(new Date(comic.timestamp), 'MMM do')}
                  </p>
                  {comic.reviewerModName && <p>Reviewer: {comic.reviewerModName}</p>}
                  {scheduledByP}
                </div>
              ) : (
                <>
                  <div className="w-fit">
                    {nameLink}
                    {publishedP}
                    {scheduledP}
                    {noTagsP}
                    {errorP}
                  </div>

                  <div className="w-fit flex flex-col items-end text-end justify-between">
                    {addedReviewerP}
                    {scheduledByP}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

export async function loader(args: LoaderArgs) {
  const { err, pendingComics } = await getPendingComics(
    args.context.DB_API_URL_BASE as string
  );

  if (err) {
    return processApiError('Error getting pending comics in mod panel', err);
  }

  return {
    pendingComics: pendingComics || [],
    dailySchedulePublishCount: parseInt(
      args.context.DAILY_SCHEDULE_PUBLISH_COUNT as string
    ),
  };
}

function getBgColor(pendingComic: DbPendingComic) {
  if (pendingComic.publishStatus === 'scheduled') {
    return 'bg-theme1-primaryMoreTrans dark:bg-theme1-primaryTrans';
  }
  if (pendingComic.errorText || pendingComic.numberOfTags === 0) {
    return 'bg-red-moreTrans dark:bg-red-trans';
  }

  return 'bg-white dark:bg-gray-300';
}

function isProblematic(pendingComic: DbPendingComic): boolean {
  return !!pendingComic.errorText || pendingComic.numberOfTags === 0;
}
