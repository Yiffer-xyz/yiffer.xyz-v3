import type { Comic, UserSession } from '~/types/types';
import LoadingButton from '~/ui-components/Buttons/LoadingButton';
import Link from '~/ui-components/Link';
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
      <p className="mb-2 text-sm">
        This comic is not live. It has been removed from the available comics on
        Yiffer.xyz for one reason or another. It can be re-listed by an admin.
      </p>

      <p>
        <b>Reason for unlisting</b>: {comicData.metadata?.unlistComment}
      </p>

      <p className="my-2">
        <Link
          href={`/c/${comicData.name}`}
          text="Preview comic page"
          showRightArrow
          isInsideParagraph
        />
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
