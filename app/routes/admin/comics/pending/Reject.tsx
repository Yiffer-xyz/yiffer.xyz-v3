import { IoCheckmark, IoClose } from 'react-icons/io5';
import Button from '~/components/Buttons/Button';
import LoadingButton from '~/components/Buttons/LoadingButton';
import { Comic } from '~/types/types';
import { useGoodFetcher } from '~/utils/useGoodFetcher';

type RejectParams = {
  comicData: Comic;
  onCancel: () => void;
  onFinish: () => void;
};

export function Reject({ comicData, onCancel, onFinish }: RejectParams) {
  const fetcher = useGoodFetcher({
    url: '/api/admin/reject-pending-comic',
    method: 'post',
    onFinish: onFinish,
    toastSuccessMessage: 'Comic rejected',
  });

  return (
    <>
      <h4 className="mb-2">Reject comic</h4>
      <fetcher.Form>
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
            isLoading={fetcher.isLoading}
            isSubmit
          />
        </div>
      </fetcher.Form>
    </>
  );
}
