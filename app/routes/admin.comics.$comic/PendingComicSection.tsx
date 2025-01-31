import { useMemo, useState } from 'react';
import Button from '~/ui-components/Buttons/Button';
import type { Comic, ComicMetadata } from '~/types/types';
import { useNavigate } from '@remix-run/react';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import { HasError, SetError } from './pending/Error';
import { Reject } from './pending/Reject';
import { Schedule } from './scheduling/Schedule';
import { ScheduledComic } from './scheduling/Scheduled';
import { useGoodFetcher } from '~/utils/useGoodFetcher';

type ActionState = 'none' | 'set-error' | 'scheduling' | 'rejecting';

type PendingComicSectionProps = {
  comicData: Comic;
  updateComic: () => void;
};

export default function PendingComicSection({
  comicData,
  updateComic,
}: PendingComicSectionProps) {
  const navigate = useNavigate();
  const metadata = comicData.metadata as ComicMetadata;
  const [actionState, setActionState] = useState<ActionState>('none');
  const publishNowFetcher = useGoodFetcher({
    url: '/api/admin/publish-comic',
    method: 'post',
    toastSuccessMessage: 'Comic published',
    onFinish: updateComic,
  });
  const addToQueueFetcher = useGoodFetcher({
    url: '/api/admin/schedule-comic-to-queue',
    method: 'post',
    toastSuccessMessage: 'Added to publishing queue',
    onFinish: updateComic,
  });

  const comicState = useMemo(() => {
    if (comicData.publishStatus === 'rejected') return 'rejected';
    if (comicData.publishStatus === 'scheduled') return 'scheduled';
    if (metadata.errorText) return 'has-error';
    return 'initial';
  }, [comicData.publishStatus, metadata.errorText]);

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

        {comicData.metadata?.source && (
          <p className="mt-2">Pages source: {comicData.metadata.source}</p>
        )}
      </div>

      <div className="flex flex-col gap-2 md:gap-4">
        <div className="flex flex-row gap-x-4 gap-y-2 flex-wrap">
          <LoadingButton
            text="Add to publishing queue"
            onClick={() => addToQueueFetcher.submit({ comicId: comicData.id.toString() })}
            isLoading={addToQueueFetcher.isLoading}
            className="min-w-40"
          />
          <Button
            text="Schedule for specific date"
            onClick={() => setActionState('scheduling')}
            className="min-w-40"
          />
          <LoadingButton
            text="Publish now"
            onClick={() => publishNowFetcher.submit({ comicId: comicData.id.toString() })}
            isLoading={publishNowFetcher.isLoading}
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
