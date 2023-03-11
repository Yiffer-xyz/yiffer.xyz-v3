import { useFetcher } from '@remix-run/react';
import { useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import { RxUpdate } from 'react-icons/rx';
import Button from '~/components/Buttons/Button';
import LoadingButton from '~/components/Buttons/LoadingButton';
import { Comic } from '~/types/types';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import InfoBox from '~/components/InfoBox';

type ScheduledComicParams = {
  comicData: Comic;
  onReschedule: () => void;
  onUnscheduleFinished: () => void;
};

export function ScheduledComic({
  comicData,
  onReschedule,
  onUnscheduleFinished,
}: ScheduledComicParams) {
  const fetcher = useFetcher();

  const hasDate = comicData.unpublishedData?.publishDate;

  useEffect(() => {
    if (fetcher.data?.success) {
      onUnscheduleFinished();
    }
  }, [fetcher]);

  return (
    <>
      {hasDate ? (
        <p className="mb-2 -mt-2">
          <b>
            Scheduled for{' '}
            {format(new Date(comicData.unpublishedData?.publishDate || ''), 'PPP')}
          </b>
        </p>
      ) : (
        <p className="mb-2 -mt-2">
          <b>Comic is in the publishing queue.</b>
        </p>
      )}

      {fetcher.data?.error && (
        <InfoBox variant="error" text={fetcher.data.error} showIcon className="mt-2" />
      )}

      <fetcher.Form action={'/api/admin/unschedule-comic'} method="post">
        <div className="flex flex-row gap-4">
          <input type="hidden" name="comicId" value={comicData.id} />
          <div className="flex flex-row gap-4">
            <LoadingButton
              text={
                hasDate ? 'Unschedule (set pending)' : 'Remove from queue (set pending)'
              }
              startIcon={IoClose}
              isLoading={fetcher.state === 'submitting'}
              color="error"
              isSubmit
            />
            <Button
              text={hasDate ? 'Re-schedule' : 'Schedule for specific date'}
              onClick={onReschedule}
              variant="outlined"
            />
          </div>
        </div>
      </fetcher.Form>
    </>
  );
}
