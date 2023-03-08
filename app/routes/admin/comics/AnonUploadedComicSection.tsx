import { useEffect } from 'react';
import { IoClose, IoCheckmark } from 'react-icons/io5';
import { Comic } from '~/types/types';
import { useFetcher } from '@remix-run/react';
import LoadingButton from '~/components/Buttons/LoadingButton';
import { format } from 'date-fns';

type AnonUploadSectionProps = {
  comicData: Comic;
  updateComic: () => void;
};

export default function AnonUploadSection({
  comicData,
  updateComic,
}: AnonUploadSectionProps) {
  const approveFetcher = useFetcher();
  const declineFetcher = useFetcher();

  useEffect(() => {
    if (approveFetcher.data?.success || declineFetcher.data?.success) {
      updateComic();
    }
  }, [approveFetcher, declineFetcher]);

  function processComic(isApproved: boolean) {
    if (isApproved) {
      approveFetcher.submit(
        { comicId: comicData.id.toString(), isApproved: 'true' },
        { method: 'post', action: '/api/admin/process-anon-upload' }
      );
    } else {
      declineFetcher.submit(
        { comicId: comicData.id.toString(), isApproved: 'false' },
        { method: 'post', action: '/api/admin/process-anon-upload' }
      );
    }
  }

  return (
    <>
      <p className="mt-2">
        This comic is not live. It has been uploaded by a user and is now up for mod
        review.
      </p>
      <p>
        You should <b>fix errors</b> before approving. If the quality of the uploaded
        content is not good enough, you should <b>reject it</b>.
      </p>
      <p>Uploaded by a guest user with IP {comicData.unpublishedData?.uploadUserIP}.</p>
      <p>
        Uploaded {format(new Date(comicData.unpublishedData?.timestamp || ''), 'PPPPp')}
      </p>
      <p>
        No review is required for guest submissions, only fixing and approval, or
        rejection.
      </p>

      <div className="flex flex-row gap-4 flex-wrap mt-4">
        <LoadingButton
          text="Reject submission"
          onClick={() => processComic(false)}
          isLoading={declineFetcher.state === 'submitting'}
          color="error"
          startIcon={IoClose}
        />
        <LoadingButton
          text="Approve submission"
          onClick={() => processComic(true)}
          isLoading={approveFetcher.state === 'submitting'}
          startIcon={IoCheckmark}
        />
      </div>
    </>
  );
}
