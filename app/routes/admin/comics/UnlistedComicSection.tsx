import { useEffect } from 'react';
import { Comic, UserSession } from '~/types/types';
import { useFetcher } from '@remix-run/react';
import LoadingButton from '~/components/Buttons/LoadingButton';
import { MaybeApiResponse } from '~/utils/request-helpers';
import InfoBox from '~/components/InfoBox';

type UnlistedComicSectionProps = {
  comicData: Comic;
  user: UserSession;
  updateComic: () => void;
};

export default function UnlistedComicSection({
  comicData,
  user,
  updateComic,
}: UnlistedComicSectionProps) {
  const fetcher = useFetcher<MaybeApiResponse>();

  useEffect(() => {
    if (fetcher.data?.success) {
      updateComic();
    }
  }, [fetcher]);

  return (
    <>
      <p className="mb-2">
        This comic is not live. It has been removed from the available comics on
        Yiffer.xyz for one reason or another. It can be re-listed by an admin.
      </p>

      <p>
        <b>Reason for unlisting</b>: {comicData.unpublishedData?.unlistComment}
      </p>

      {fetcher.data?.error && (
        <InfoBox variant="error" text={fetcher.data.error} showIcon className="mt-2" />
      )}

      {user.userType === 'admin' && (
        <fetcher.Form action="/api/admin/relist-comic" method="post">
          <LoadingButton
            text="Re-list comic"
            isLoading={fetcher.state === 'submitting'}
            isSubmit
            className="mt-2"
          />

          <input type="hidden" name="comicId" value={comicData.id.toString()} />
        </fetcher.Form>
      )}
    </>
  );
}
