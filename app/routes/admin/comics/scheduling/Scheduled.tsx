import { useFetcher } from '@remix-run/react';
import { useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import { RxUpdate } from 'react-icons/rx';
import Button from '~/components/Buttons/Button';
import LoadingButton from '~/components/Buttons/LoadingButton';
import { Comic } from '~/types/types';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';

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

  useEffect(() => {
    if (fetcher.data?.success) {
      onUnscheduleFinished();
    }
  }, [fetcher]);

  return (
    <>
      <p className="mb-2">
        <b>
          Scheduled for{' '}
          {format(new Date(comicData.unpublishedData?.publishDate || ''), 'PPP')}
        </b>
      </p>
      <fetcher.Form action="/api/admin/schedule-comic" method="post">
        <div className="flex flex-row gap-4">
          <input type="hidden" name="comicId" value={comicData.id} />
          <div className="flex flex-row gap-4">
            <LoadingButton
              text="Un-schedule"
              startIcon={IoClose}
              isLoading={fetcher.state === 'submitting'}
              isSubmit
            />
            <Button text="Reschedule" onClick={onReschedule} startIcon={RxUpdate} />
          </div>
        </div>
      </fetcher.Form>
    </>
  );
}
