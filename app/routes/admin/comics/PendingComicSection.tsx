import { useEffect, useMemo, useState } from 'react';
import Button from '~/components/Buttons/Button';
import { Comic, UnpublishedComicData } from '~/types/types';
import { useFetcher, useNavigate } from '@remix-run/react';
import LoadingButton from '~/components/Buttons/LoadingButton';
import { HasError, SetError } from './pending/Error';
import { Reject } from './pending/Reject';
import { Schedule } from './scheduling/Schedule';
import { ScheduledComic } from './scheduling/Scheduled';
import InfoBox from '~/components/InfoBox';

type PendingComicSectionProps = {
  comicData: Comic;
  updateComic: () => void;
};

type ActionState = 'none' | 'set-error' | 'scheduling' | 'rejecting';

export default function PendingComicSection({
  comicData,
  updateComic,
}: PendingComicSectionProps) {
  const navigate = useNavigate();
  const unpublishedData = comicData.unpublishedData as UnpublishedComicData;
  const [actionState, setActionState] = useState<ActionState>('none');
  const publishNowFetcher = useFetcher();
  const addToPublishingQueueFetcher = useFetcher();

  const comicState = useMemo(() => {
    if (comicData.publishStatus === 'rejected') return 'rejected';
    if (comicData.publishStatus === 'scheduled') return 'scheduled';
    if (unpublishedData.errorText) return 'has-error';
    return 'initial';
  }, [comicData]);

  useEffect(() => {
    if (publishNowFetcher.data?.success || addToPublishingQueueFetcher.data?.success) {
      updateComic();
    }
  }, [publishNowFetcher]);

  function publishNow() {
    publishNowFetcher.submit(
      { comicId: comicData.id.toString() },
      { method: 'post', action: '/api/admin/publish-comic' }
    );
  }

  function addToPublishingQueue() {
    addToPublishingQueueFetcher.submit(
      { comicId: comicData.id.toString() },
      { method: 'post', action: '/api/admin/schedule-comic-to-queue' }
    );
  }

  if (actionState === 'set-error') {
    return (
      <SetError
        comicData={comicData}
        onCancel={() => setActionState('none')}
        onFinish={() => {
          setActionState('none');
          updateComic();
        }}
      />
    );
  }

  if (comicState === 'has-error') {
    return <HasError comicData={comicData} onFinish={updateComic} />;
  }

  if (actionState === 'rejecting') {
    return (
      <Reject
        comicData={comicData}
        onCancel={() => setActionState('none')}
        onFinish={() => {
          setActionState('none');
          updateComic();
          navigate(`/admin/comics`);
        }}
      />
    );
  }

  if (actionState === 'scheduling') {
    return (
      <Schedule
        comicData={comicData}
        onCancel={() => setActionState('none')}
        onFinish={() => {
          setActionState('none');
          updateComic();
        }}
      />
    );
  }

  if (comicData.publishStatus === 'scheduled') {
    return (
      <ScheduledComic
        comicData={comicData}
        onReschedule={() => setActionState('scheduling')}
        onUnscheduleFinished={updateComic}
      />
    );
  }

  return (
    <div>
      <div className="mb-4 -mt-2">
        <p>
          Normally, add the comic to the publishing queue. Only in specific cases (for
          example per an artist's request) should a comic be scheduled for a specific
          date.
        </p>

        {comicData.artist.isPending && (
          <p className="mt-2">
            This comic's <b>artist is pending</b>. Once this or any other pending comic by
            the artist is published, the artist will automatically do the same.
          </p>
        )}
      </div>

      {publishNowFetcher.data?.error && (
        <InfoBox
          variant="error"
          text={publishNowFetcher.data.error}
          showIcon
          className="mt-4"
        />
      )}
      {addToPublishingQueueFetcher.data?.error && (
        <InfoBox
          variant="error"
          text={addToPublishingQueueFetcher.data.error}
          showIcon
          className="mt-4"
        />
      )}

      <div className="flex flex-col gap-4">
        <div className="flex flex-row gap-4 flex-wrap">
          <LoadingButton
            text="Add to publishing queue"
            onClick={addToPublishingQueue}
            isLoading={addToPublishingQueueFetcher.state === 'submitting'}
            className="min-w-40"
          />
          <Button
            text="Schedule for specific date"
            onClick={() => setActionState('scheduling')}
            className="min-w-40"
          />
          <LoadingButton
            text="Publish now"
            onClick={publishNow}
            isLoading={publishNowFetcher.state === 'submitting'}
            className="min-w-40"
          />
        </div>
        <Button
          text="Set error"
          color="error"
          onClick={() => setActionState('set-error')}
          className="min-w-40"
        />
        <Button
          text="Reject comic"
          color="error"
          onClick={() => setActionState('rejecting')}
          className="min-w-40"
        />
      </div>
    </div>
  );
}
