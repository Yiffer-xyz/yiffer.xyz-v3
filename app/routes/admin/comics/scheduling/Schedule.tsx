import { useFetcher } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { IoCheckmark, IoClose } from 'react-icons/io5';
import Button from '~/components/Buttons/Button';
import LoadingButton from '~/components/Buttons/LoadingButton';
import { Comic } from '~/types/types';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';

type ScheduleParams = {
  comicData: Comic;
  onCancel: () => void;
  onFinish: () => void;
};

export function Schedule({ comicData, onCancel, onFinish }: ScheduleParams) {
  const [publishDate, setPublishDate] = useState<Date>(
    comicData.unpublishedData?.publishDate
      ? new Date(comicData.unpublishedData.publishDate)
      : new Date()
  );

  const fetcher = useFetcher();
  const dateString = publishDate ? format(publishDate, 'yyyy-MM-dd') : '';

  useEffect(() => {
    if (fetcher.data?.success) {
      onFinish();
    }
  }, [fetcher]);

  return (
    <>
      <h4 className="mb-2">Schedule comic</h4>
      <fetcher.Form action="/api/admin/schedule-comic" method="post">
        <input type="hidden" name="comicId" value={comicData.id} />
        <input type="hidden" name="publishDate" value={dateString} />

        <Calendar value={publishDate} onChange={setPublishDate} className="pb-2 w-fit" />

        <p className="mb-4">
          <b>
            {publishDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </b>
        </p>

        <div className="flex flex-row gap-4">
          <Button
            text="Cancel"
            variant="outlined"
            onClick={onCancel}
            startIcon={IoClose}
          />
          <LoadingButton
            text="Schedule comic"
            startIcon={IoCheckmark}
            isLoading={fetcher.state === 'submitting'}
            isSubmit
            disabled={!dateString}
          />
        </div>
      </fetcher.Form>
    </>
  );
}
