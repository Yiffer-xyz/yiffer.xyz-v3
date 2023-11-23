import type { Comic, UserSession } from '~/types/types';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import { useGoodFetcher } from '~/utils/useGoodFetcher';

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
  const fetcher = useGoodFetcher({
    url: '/api/admin/relist-comic',
    method: 'post',
    toastSuccessMessage: 'Comic re-listed',
    onFinish: updateComic,
  });

  return (
    <>
      <p className="mb-2">
        This comic is not live. It has been removed from the available comics on
        Yiffer.xyz for one reason or another. It can be re-listed by an admin.
      </p>

      <p>
        <b>Reason for unlisting</b>: {comicData.metadata?.unlistComment}
      </p>

      {user.userType === 'admin' && (
        <fetcher.Form>
          <LoadingButton
            text="Re-list comic"
            isLoading={fetcher.isLoading}
            isSubmit
            className="mt-2"
          />

          <input type="hidden" name="comicId" value={comicData.id.toString()} />
        </fetcher.Form>
      )}
    </>
  );
}
