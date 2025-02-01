import { useLoaderData } from '@remix-run/react';
import { format } from 'date-fns';
import { useMemo, useState } from 'react';
import { MdArrowDownward, MdArrowUpward, MdCheck, MdError } from 'react-icons/md';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import LoadingIconButton from '~/ui-components/Buttons/LoadingIconButton';
import Link from '~/ui-components/Link';
import RadioButtonGroup from '~/ui-components/RadioButton/RadioButtonGroup';
import { isAdmin, type PendingComic } from '~/types/types';
import { processApiError } from '~/utils/request-helpers';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import useWindowSize from '~/utils/useWindowSize';
import { getPendingComics } from '~/route-funcs/get-pending-comics';
import { LuRefreshCcw } from 'react-icons/lu';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { authLoader } from '~/utils/loaders';
export { AdminErrorBoundary as ErrorBoundary } from '~/utils/error';

type PendingComicsFilter = 'all' | 'scheduled' | 'unscheduled' | 'problematic';

const filterOptions: { value: PendingComicsFilter; text: string }[] = [
  { value: 'all', text: 'All' },
  { value: 'scheduled', text: 'Publishing queue' },
  { value: 'unscheduled', text: 'Unscheduled only' },
  { value: 'problematic', text: 'Problematic only' },
];

export const meta: MetaFunction = () => {
  return [{ title: `Mod: Pending comics | Yiffer.xyz` }];
};

export default function PendingComics() {
  const { pendingComics, dailySchedulePublishCount, user } =
    useLoaderData<typeof loader>();
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
        Comics in the publishing queue are published daily.{' '}
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
            startIcon={LuRefreshCcw}
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
              <MdCheck /> Scheduled: {format(comic.publishDate, 'MMM do')}
            </p>
          );

          const scheduledP = comic.publishStatus === 'scheduled' &&
            !comic.publishDate && (
              <div className="flex flex-row items-center">
                <p>
                  <MdCheck /> Publishing queue, {comic.publishingQueuePos ?? '?'}/
                  {totalPublishingQueueLength}
                </p>
                {isAdmin(user) && false && (
                  <>
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
                  </>
                )}
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
              {format(comic.timestamp, 'MMM do')}
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
                    {format(comic.timestamp, 'MMM do')}
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

export async function loader(args: LoaderFunctionArgs) {
  const user = await authLoader(args);
  const dbRes = await getPendingComics(args.context.cloudflare.env.DB);

  if (dbRes.err) {
    return processApiError('Error getting pending comics in mod panel', dbRes.err);
  }

  return {
    pendingComics: dbRes.result,
    dailySchedulePublishCount: parseInt(
      args.context.cloudflare.env.DAILY_SCHEDULE_PUBLISH_COUNT
    ),
    user: user!,
  };
}

function getBgColor(pendingComic: PendingComic) {
  if (pendingComic.publishStatus === 'scheduled') {
    return 'bg-theme1-primaryMoreTrans dark:bg-theme1-primaryTrans';
  }
  if (pendingComic.errorText || pendingComic.numberOfTags === 0) {
    return 'bg-red-moreTrans dark:bg-red-trans';
  }

  return 'bg-white dark:bg-gray-300';
}

function isProblematic(pendingComic: PendingComic): boolean {
  return !!pendingComic.errorText || pendingComic.numberOfTags === 0;
}
