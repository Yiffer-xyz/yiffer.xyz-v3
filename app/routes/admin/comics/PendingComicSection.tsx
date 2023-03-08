import { useEffect, useMemo, useState } from 'react';
import Button from '~/components/Buttons/Button';
import { Comic, UnpublishedComicData } from '~/types/types';
import { useFetcher, useNavigate } from '@remix-run/react';
import LoadingButton from '~/components/Buttons/LoadingButton';
import { HasError, SetError } from './pending/Error';
import { Reject } from './pending/Reject';
import { Schedule } from './scheduling/Schedule';
import { ScheduledComic } from './scheduling/Scheduled';

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

  const comicState = useMemo(() => {
    if (comicData.publishStatus === 'rejected') return 'rejected';
    if (unpublishedData.publishDate) return 'scheduled';
    if (unpublishedData.errorText) return 'has-error';
    return 'initial';
  }, [comicData]);

  useEffect(() => {
    if (publishNowFetcher.data?.success) {
      updateComic();
    }
  }, [publishNowFetcher]);

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

  if (!!unpublishedData.publishDate) {
    return (
      <ScheduledComic
        comicData={comicData}
        onReschedule={() => setActionState('scheduling')}
        onUnscheduleFinished={updateComic}
      />
    );
  }

  return (
    <publishNowFetcher.Form action="/api/admin/publish-comic" method="post">
      <input type="hidden" name="comicId" value={comicData.id} />

      <div className="flex flex-col gap-4">
        <div className="flex flex-row gap-4 flex-wrap">
          <Button
            text="Schedule"
            onClick={() => setActionState('scheduling')}
            className="w-40"
          />
          <LoadingButton
            text="Publish now"
            className="w-40"
            isLoading={publishNowFetcher.state === 'submitting'}
            isSubmit
          />
        </div>
        <Button
          text="Set error"
          onClick={() => setActionState('set-error')}
          className="w-40"
        />
        <Button
          text="Reject comic"
          color="error"
          onClick={() => setActionState('rejecting')}
          className="w-40"
        />
      </div>
    </publishNowFetcher.Form>
  );
}
