import Button from '~/ui-components/Buttons/Button';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import type { Comic } from '~/types/types';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import type { GlobalAdminContext } from '~/routes/admin/route';
import { isAdmin as isUserAdmin } from '~/types/types';
import { useOutletContext } from '@remix-run/react';

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
  const globalContext: GlobalAdminContext = useOutletContext();
  const isAdmin = isUserAdmin(globalContext.user);

  const fetcher = useGoodFetcher({
    url: '/api/admin/unschedule-comic',
    method: 'post',
    toastSuccessMessage: 'Comic unscheduled',
    onFinish: onUnscheduleFinished,
  });

  const hasDate = comicData.metadata?.publishDate;

  return (
    <>
      {comicData.metadata?.source && (
        <p className="mb-4 -mt-2">Pages source: {comicData.metadata.source}</p>
      )}

      {hasDate ? (
        <p className="mb-2 -mt-2">
          <b>Scheduled for {format(comicData.metadata?.publishDate || '', 'PPP')}</b>
        </p>
      ) : (
        <p className="mb-2 -mt-2">
          <b>Comic is in the publishing queue.</b>
        </p>
      )}

      <fetcher.Form>
        <div className="flex flex-row gap-4">
          <input type="hidden" name="comicId" value={comicData.id} />
          <div className="flex flex-row flex-wrap gap-x-4 gap-y-2">
            <LoadingButton
              text={
                hasDate ? 'Unschedule (set pending)' : 'Remove from queue (set pending)'
              }
              isLoading={fetcher.isLoading}
              color="error"
              isSubmit
            />
            {isAdmin && (
              <Button
                text={hasDate ? 'Re-schedule' : 'Schedule for specific date'}
                onClick={onReschedule}
              />
            )}
          </div>
        </div>
      </fetcher.Form>
    </>
  );
}
