import { useState } from 'react';
import { IoCheckmark, IoClose } from 'react-icons/io5';
import Button from '~/ui-components/Buttons/Button';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import type { Comic } from '~/types/types';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import { useGoodFetcher } from '~/utils/useGoodFetcher';

type ScheduleParams = {
  comicData: Comic;
  onCancel: () => void;
  onFinish: () => void;
};

export function Schedule({ comicData, onCancel, onFinish }: ScheduleParams) {
  const [publishDate, setPublishDate] = useState<Date>(
    comicData.metadata?.publishDate ?? new Date()
  );

  const fetcher = useGoodFetcher({
    url: '/api/admin/schedule-comic',
    method: 'post',
    onFinish: onFinish,
    toastSuccessMessage: 'Comic scheduled',
  });

  const dateString = publishDate ? format(publishDate, 'yyyy-MM-dd') : '';

  return (
    <>
      <h4 className="mb-2">Schedule comic</h4>
      <fetcher.Form>
        <input type="hidden" name="comicId" value={comicData.id} />
        <input type="hidden" name="publishDate" value={dateString} />

        <Calendar
          value={publishDate}
          onChange={newDate => setPublishDate(newDate as Date)}
          className="pb-2 w-fit"
        />

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
            isLoading={fetcher.isLoading}
            isSubmit
            disabled={!dateString}
          />
        </div>
      </fetcher.Form>
    </>
  );
}
