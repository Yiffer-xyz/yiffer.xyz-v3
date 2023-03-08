import { useFetcher } from '@remix-run/react';
import { useEffect } from 'react';
import { IoCheckmark, IoClose } from 'react-icons/io5';
import Button from '~/components/Buttons/Button';
import LoadingButton from '~/components/Buttons/LoadingButton';
import { Comic } from '~/types/types';

type RejectParams = {
  comicData: Comic;
  onCancel: () => void;
  onFinish: () => void;
};

export function Reject({ comicData, onCancel, onFinish }: RejectParams) {
  const fetcher = useFetcher();
  useEffect(() => {
    if (fetcher.data?.success) {
      onFinish();
    }
  }, [fetcher]);

  return (
    <>
      <h4 className="mb-2">Reject comic</h4>
      <fetcher.Form action="/api/admin/reject-pending-comic" method="post">
        <input type="hidden" name="comicId" value={comicData.id} />

        <div className="flex flex-row gap-4">
          <Button
            text="Cancel"
            variant="outlined"
            onClick={onCancel}
            startIcon={IoClose}
          />
          <LoadingButton
            text="Reject comic"
            startIcon={IoCheckmark}
            color="error"
            isLoading={fetcher.state === 'submitting'}
            isSubmit
          />
        </div>
      </fetcher.Form>
    </>
  );
}
